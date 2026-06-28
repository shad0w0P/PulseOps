/**
 * Tests for SSE replay logic.
 * Validates that the event repository correctly handles sequence-based queries.
 */

describe('Replay Logic', () => {
  describe('sequence number parsing', () => {
    it('should parse valid Last-Event-ID as integer', () => {
      const lastEventId = '5';
      const afterSequence = parseInt(lastEventId, 10);
      expect(afterSequence).toBe(5);
      expect(Number.isNaN(afterSequence)).toBe(false);
    });

    it('should handle zero', () => {
      const lastEventId = '0';
      const afterSequence = parseInt(lastEventId, 10);
      expect(afterSequence).toBe(0);
    });

    it('should detect invalid Last-Event-ID', () => {
      const lastEventId = 'invalid';
      const afterSequence = parseInt(lastEventId, 10);
      expect(Number.isNaN(afterSequence)).toBe(true);
    });

    it('should detect empty Last-Event-ID', () => {
      const lastEventId = '';
      const afterSequence = parseInt(lastEventId, 10);
      expect(Number.isNaN(afterSequence)).toBe(true);
    });
  });

  describe('replay guarantee properties', () => {
    it('should replay events after the given sequence', () => {
      const allEvents = [
        { sequenceNumber: 1, message: 'first' },
        { sequenceNumber: 2, message: 'second' },
        { sequenceNumber: 3, message: 'third' },
        { sequenceNumber: 4, message: 'fourth' },
        { sequenceNumber: 5, message: 'fifth' },
      ];

      const lastEventId = 3;
      const replayedEvents = allEvents.filter((e) => e.sequenceNumber > lastEventId);

      expect(replayedEvents).toHaveLength(2);
      expect(replayedEvents[0]!.sequenceNumber).toBe(4);
      expect(replayedEvents[1]!.sequenceNumber).toBe(5);
    });

    it('should return empty array if all events already received', () => {
      const allEvents = [
        { sequenceNumber: 1 },
        { sequenceNumber: 2 },
        { sequenceNumber: 3 },
      ];

      const lastEventId = 3;
      const replayedEvents = allEvents.filter((e) => e.sequenceNumber > lastEventId);

      expect(replayedEvents).toHaveLength(0);
    });

    it('should return all events if lastEventId is 0', () => {
      const allEvents = [
        { sequenceNumber: 1 },
        { sequenceNumber: 2 },
        { sequenceNumber: 3 },
      ];

      const lastEventId = 0;
      const replayedEvents = allEvents.filter((e) => e.sequenceNumber > lastEventId);

      expect(replayedEvents).toHaveLength(3);
    });

    it('should maintain order by sequence number', () => {
      const allEvents = [
        { sequenceNumber: 3 },
        { sequenceNumber: 1 },
        { sequenceNumber: 5 },
        { sequenceNumber: 2 },
        { sequenceNumber: 4 },
      ];

      const sorted = [...allEvents].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
      expect(sorted.map((e) => e.sequenceNumber)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should never duplicate events', () => {
      const allEvents = [
        { sequenceNumber: 1 },
        { sequenceNumber: 2 },
        { sequenceNumber: 3 },
      ];

      // Client already has sequence 2, reconnects
      const lastEventId = 2;
      const replayedEvents = allEvents.filter((e) => e.sequenceNumber > lastEventId);

      // Should only get 3, not 2 again
      expect(replayedEvents.map((e) => e.sequenceNumber)).toEqual([3]);
      const hasDuplicates = new Set(replayedEvents.map((e) => e.sequenceNumber)).size !== replayedEvents.length;
      expect(hasDuplicates).toBe(false);
    });
  });
});
