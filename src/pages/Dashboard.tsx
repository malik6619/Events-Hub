import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Ticket, Users, DollarSign, Plus, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  start_date: string;
  image_url: string | null;
  status: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch events
      const { data: events, error: eventsError } = await supabase
        .from('app_92ee3_events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (eventsError) throw eventsError;

      // Fetch orders for revenue calculation
      const { data: orders, error: ordersError } = await supabase
        .from('app_92ee3_orders')
        .select('total_amount, status, event_id')
        .eq('status', 'completed')
        .in(
          'event_id',
          events?.map((e) => e.id) || []
        );

      if (ordersError) throw ordersError;

      // Fetch tickets sold
      const { data: tickets, error: ticketsError } = await supabase
        .from('app_92ee3_tickets')
        .select('sold, event_id')
        .in(
          'event_id',
          events?.map((e) => e.id) || []
        );

      if (ticketsError) throw ticketsError;

      const totalTicketsSold = tickets?.reduce((sum, t) => sum + (t.sold || 0), 0) || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount.toString()), 0) || 0;
      const activeEvents = events?.filter((e) => e.status === 'published').length || 0;

      setStats({
        totalEvents: events?.length || 0,
        activeEvents,
        totalTicketsSold,
        totalRevenue,
      });

      setRecentEvents(events || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your event overview.</p>
          </div>
          <Button onClick={() => navigate('/events/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={<Calendar className="h-6 w-6 text-indigo-600" />}
            trend="+12%"
          />
          <StatCard
            title="Active Events"
            value={stats.activeEvents}
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
            trend="+8%"
          />
          <StatCard
            title="Tickets Sold"
            value={stats.totalTicketsSold}
            icon={<Ticket className="h-6 w-6 text-purple-600" />}
            trend="+23%"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={<DollarSign className="h-6 w-6 text-amber-600" />}
            trend="+15%"
          />
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No events yet</p>
                <Button onClick={() => navigate('/events/create')}>Create Your First Event</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-indigo-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {format(new Date(event.start_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          event.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : event.status === 'draft'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {event.status}
                      </span>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
          <span className="text-sm text-green-600 font-medium">{trend}</span>
        </div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );
}