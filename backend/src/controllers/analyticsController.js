const prisma = require('../config/prisma');

exports.getAnalytics = async (req, res) => {
  try {
    
    const totalEvents = await prisma.event.count();

    const eventsWithCount = await prisma.event.findMany({
      select: {
        _count: { select: { attendees: true } }
      }
    });
    const avgAttendance =
      eventsWithCount.length > 0
        ? eventsWithCount.reduce((sum, e) => sum + e._count.attendees, 0) /
          eventsWithCount.length
        : 0;

    const events = await prisma.event.findMany({ select: { startTime: true } });
    const hourCounts = {};
    events.forEach(e => {
      const hour = e.startTime.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const popularHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: Number(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topAttendees = await prisma.eventAttendee.groupBy({
      by: ['attendeeId'],
      _count: { attendeeId: true },
      orderBy: { _count: { attendeeId: 'desc' } },
      take: 5
    });

    const attendeeDetails = await prisma.attendee.findMany({
      where: { id: { in: topAttendees.map(a => a.attendeeId) } },
      select: { id: true, name: true, email: true }
    });

    const topAttendeesWithInfo = topAttendees.map(a => ({
      ...attendeeDetails.find(ad => ad.id === a.attendeeId),
      eventCount: a._count.attendeeId
    }));

    res.json({
      totalEvents,
      averageAttendance: avgAttendance,
      mostPopularHours: popularHours,
      topAttendees: topAttendeesWithInfo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
