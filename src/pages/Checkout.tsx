import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Minus, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  start_date: string;
  location: string | null;
}

interface Ticket {
  id: string;
  name: string;
  price: number;
  description: string | null;
  sold: number;
}

export default function Checkout() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadEventAndTickets();
  }, [eventId]);

  const loadEventAndTickets = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('app_92ee3_events')
        .select('*')
        .eq('id', eventId)
        .eq('status', 'published')
        .single();

      if (eventError) throw eventError;

      const { data: ticketsData, error: ticketsError } = await supabase
        .from('app_92ee3_tickets')
        .select('*')
        .eq('event_id', eventId);

      if (ticketsError) throw ticketsError;

      setEvent(eventData);
      setTickets(ticketsData || []);
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error('Event not found');
    } finally {
      setLoading(false);
    }
  };

  const updateCart = (ticketId: string, change: number) => {
    setCart((prev) => {
      const newQuantity = (prev[ticketId] || 0) + change;
      if (newQuantity <= 0) {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ticketId]: newQuantity };
    });
  };

  const calculateTotal = () => {
    return tickets.reduce((total, ticket) => {
      const quantity = cart[ticket.id] || 0;
      return total + ticket.price * quantity;
    }, 0);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(cart).length === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    setProcessing(true);
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('app_92ee3_orders')
        .insert([
          {
            event_id: eventId,
            order_number: orderNumber,
            total_amount: calculateTotal(),
            status: 'completed',
            customer_email: customerInfo.email,
            customer_name: customerInfo.name,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items and attendees
      for (const [ticketId, quantity] of Object.entries(cart)) {
        const ticket = tickets.find((t) => t.id === ticketId);
        if (!ticket) continue;

        // Create order item
        await supabase.from('app_92ee3_order_items').insert([
          {
            order_id: order.id,
            ticket_id: ticketId,
            quantity,
            price: ticket.price,
          },
        ]);

        // Create attendees with QR codes
        for (let i = 0; i < quantity; i++) {
          const qrCode = `${order.id}-${ticketId}-${i}`;
          await supabase.from('app_92ee3_attendees').insert([
            {
              order_id: order.id,
              ticket_id: ticketId,
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone,
              qr_code: qrCode,
            },
          ]);
        }

        // Update ticket sold count
        await supabase
          .from('app_92ee3_tickets')
          .update({ sold: ticket.sold + quantity })
          .eq('id', ticketId);
      }

      toast.success('Order completed successfully!');
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete order';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Event not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Event Info & Tickets */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h1>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.start_date), 'PPpp')}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                      <p className="text-sm text-gray-600">${ticket.price}</p>
                      {ticket.description && <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCart(ticket.id, -1)}
                        disabled={!cart[ticket.id]}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{cart[ticket.id] || 0}</span>
                      <Button variant="outline" size="sm" onClick={() => updateCart(ticket.id, 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    />
                  </div>

                  <div className="border-t pt-4 mt-6">
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-indigo-600">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={processing}>
                      {processing ? 'Processing...' : 'Complete Order'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}