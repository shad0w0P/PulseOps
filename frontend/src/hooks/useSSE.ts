import { useEffect, useState, useRef } from 'react';
import { type AutomationEvent } from 'shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const BEARER_TOKEN = process.env.NEXT_PUBLIC_API_BEARER_TOKEN || 'your-api-bearer-token-here';

interface UseSSEOptions {
  jobId: string;
  onEvent?: (event: AutomationEvent) => void;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected') => void;
}

export function useSSE({ jobId, onEvent, onStatusChange }: UseSSEOptions) {
  const [events, setEvents] = useState<AutomationEvent[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const lastEventIdRef = useRef<number>(0);
  const activeControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const connect = async () => {
      // Clean up previous connection
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
      }

      setStatus('connecting');
      onStatusChange?.('connecting');

      const controller = new AbortController();
      activeControllerRef.current = controller;

      try {
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
        };

        // If we have a last event ID, request replay by sending the header.
        if (lastEventIdRef.current > 0) {
          headers['Last-Event-ID'] = String(lastEventIdRef.current);
        }

        const response = await fetch(`${API_URL}/jobs/${jobId}/stream`, {
          headers,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to connect to event stream: ${response.statusText}`);
        }

        setStatus('connected');
        onStatusChange?.('connected');

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body reader is not available');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split('\n\n');
          buffer = messages.pop() || ''; // Hold onto incomplete message chunk

          for (const rawMessage of messages) {
            const lines = rawMessage.split('\n');
            let currentEventId: string | null = null;
            let eventType: string | null = null;
            let data: string | null = null;

            for (const line of lines) {
              if (line.startsWith('id: ')) {
                currentEventId = line.slice(4).trim();
              } else if (line.startsWith('event: ')) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith('data: ')) {
                data = line.slice(6).trim();
              }
            }

            if (currentEventId) {
              const seq = parseInt(currentEventId, 10);
              if (!isNaN(seq)) {
                lastEventIdRef.current = seq;
              }
            }

            if (eventType === 'automation-event' && data) {
              try {
                const parsedEvent: AutomationEvent = JSON.parse(data);
                
                // Deduplicate events locally in state
                setEvents((prev) => {
                  if (prev.some((e) => e.sequenceNumber === parsedEvent.sequenceNumber)) {
                    return prev; // Duplicate, skip
                  }
                  const updated = [...prev, parsedEvent].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
                  return updated;
                });

                onEvent?.(parsedEvent);
              } catch (err) {
                console.error('Failed to parse event data:', err);
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Event stream connection aborted intentionally.');
          return;
        }

        console.error('SSE Stream error:', err);
        setStatus('disconnected');
        onStatusChange?.('disconnected');

        // Automatic reconnection attempt with backoff
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting automatic SSE reconnect...');
          connect();
        }, 3000);
      }
    };

    connect();

    return () => {
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [jobId]);

  return { events, status, setEvents };
}
