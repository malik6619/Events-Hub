import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Download, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

interface Attendee {
  id: string;
  name: string;
  email: string;
  qr_code: string;
  checked_in: boolean;
  ticket?: { name: string };
}

export default function Attendees() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendees();
  }, [id]);

  const loadAttendees = async () => {
    try {
      const { data, error } = await supabase
        .from('app_92ee3_attendees')
        .select(`
          *,
          order:app_92ee3_orders!inner(event_id),
          ticket:app_92ee3_tickets(name)
        `)
        .eq('order.event_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttendees(data || []);
    } catch (error) {
      console.error('Error loading attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendees = attendees.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(`/events/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attendees ({filteredAttendees.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search attendees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading attendees...</p>
            ) : filteredAttendees.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No attendees found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAttendees.map((attendee) => (
                  <div key={attendee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{attendee.name}</h3>
                        {attendee.checked_in ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Checked In
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Checked In
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{attendee.email}</p>
                      <p className="text-sm text-gray-500 mt-1">Ticket: {attendee.ticket?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">QR: {attendee.qr_code.slice(0, 8)}...</p>
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