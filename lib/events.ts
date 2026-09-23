import { supabase } from '@/lib/supabase';

export type EventInput = {
  eventId: string;
  title: string;
  start: string;
  end: string;
};

export type CloudEvent = {
  id: string;
  event_code: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  created_by: string | null;
  created_at: string;
};

export async function createEvent(event: EventInput, teacherId: string) {
  const { error } = await supabase.from('events').upsert(
    {
      event_code: event.eventId,
      title: event.title,
      start_time: event.start,
      end_time: event.end,
      created_by: teacherId,
    },
    { onConflict: 'event_code' }
  );
  return { error: error?.message ?? null };
}

export async function getEventsByTeacher(teacherId: string): Promise<CloudEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', teacherId)
    .order('created_at', { ascending: false });
  return error || !data ? [] : (data as CloudEvent[]);
}

export async function getEventByCode(code: string): Promise<CloudEvent | null> {
  const { data, error } = await supabase.from('events').select('*').eq('event_code', code).maybeSingle();
  return error || !data ? null : (data as CloudEvent);
}
