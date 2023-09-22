import { PostgrestError, createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import { from } from "../fp/Result";

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);

type CalcResult = ReturnType<ReturnType<typeof supabase.from>["select"]>;

export async function query<T extends CalcResult>(
  handler: (sb: typeof supabase) => T
) {
  const { data, error } = await handler(supabase);

  return from<Awaited<T>["data"], PostgrestError>(data, error!);
}
