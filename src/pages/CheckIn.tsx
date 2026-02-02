import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  checked_in: boolean;
  ticket?: { name: string };
}

export default function CheckIn() {
  const { eventId } = useParams();
  const [qrCode, setQrCode] = useState('');
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_92ee3_attendees')
        .select(`
          *,
          order:app_92ee3_orders!inner(event_id),
          ticket:app_92ee3_tickets(name)
        `)
        .eq('qr_code', qrCode.trim())
        .eq('order.event_id', eventId)
        .single();

      if (error) throw error;

      setAttendee(data);
    } catch (error) {
      toast.error('Attendee not found');
      setAttendee(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!attendee) return;

    try {
      const { error } = await supabase
        .from('app_92ee3_attendees')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', attendee.id);

      if (error) throw error;

      toast.success('Check-in successful!');
      setAttendee({ ...attendee, checked_in: true });
      setQrCode('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check in';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Event Check-In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qrCode">QR Code or Ticket ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="qrCode"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="Enter QR code or scan"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </form>

            {attendee && (
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{attendee.name}</h3>
                  {attendee.checked_in ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-6 w-6" />
                      <span className="font-medium">Checked In</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-600">
                      <XCircle className="h-6 w-6" />
                      <span className="font-medium">Not Checked In</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-medium">Email:</span> {attendee.email}
                  </p>
                  {attendee.phone && (
                    <p>
                      <span className="font-medium">Phone:</span> {attendee.phone}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Ticket:</span> {attendee.ticket?.name}
                  </p>
                </div>

                {!attendee.checked_in && (
                  <Button onClick={handleCheckIn} className="w-full" size="lg">
                    Check In Attendee
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}