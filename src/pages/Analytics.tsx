import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, DollarSign, Ticket, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ticketsSold: 0,
    totalAttendees: 0,
    checkedIn: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [id]);

  const loadAnalytics = async () => {
    try {
      // Fetch orders
      const { data: orders } = await supabase
        .from('app_92ee3_orders')
        .select('total_amount, status')
        .eq('event_id', id)
        .eq('status', 'completed');

      // Fetch tickets
      const { data: tickets } = await supabase
        .from('app_92ee3_tickets')
        .select('sold')
        .eq('event_id', id);

      // Fetch attendees
      const { data: attendees } = await supabase
        .from('app_92ee3_attendees')
        .select('checked_in, order:app_92ee3_orders!inner(event_id)')
        .eq('order.event_id', id);

      const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount.toString()), 0) || 0;
      const ticketsSold = tickets?.reduce((sum, t) => sum + (t.sold || 0), 0) || 0;
      const checkedIn = attendees?.filter((a) => a.checked_in).length || 0;

      setStats({
        totalRevenue,
        ticketsSold,
        totalAttendees: attendees?.length || 0,
        checkedIn,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(`/events/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Event
        </Button>

        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>

        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading analytics...</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Ticket className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Tickets Sold</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.ticketsSold}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Total Attendees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAttendees}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Checked In</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.checkedIn} / {stats.totalAttendees}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Detailed charts and reports will be displayed here.</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}