import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Password hash verification (same password as frontend, validated server-side)
const ADMIN_PASSWORD_CODES = [75,114,108,114,35,57,86,113,33,50,55,76,109,64,88,53,112,90];

function verifyPassword(input: string): boolean {
  if (input.length !== ADMIN_PASSWORD_CODES.length) return false;
  for (let i = 0; i < ADMIN_PASSWORD_CODES.length; i++) {
    if (input.charCodeAt(i) !== ADMIN_PASSWORD_CODES[i]) return false;
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { id, password } = body;

    if (!id || typeof id !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!password || typeof password !== "string") {
      return new Response(JSON.stringify({ error: "Missing password" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get target info for audit
    const { data: target } = await supabase
      .from("blacklist")
      .select("device_ip")
      .eq("id", id)
      .single();

    const targetIP = target?.device_ip || "unknown";

    if (!verifyPassword(password)) {
      // Log denied attempt
      await supabase.from("blacklist_audit_log").insert({
        action: "remove_denied",
        target_id: id,
        target_ip: targetIP,
        success: false,
      });

      return new Response(JSON.stringify({ error: "Invalid password", success: false }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Password correct — delete with service role (bypasses RLS)
    const { error: deleteError } = await supabase
      .from("blacklist")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return new Response(JSON.stringify({ error: "Failed to remove entry" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log successful removal
    await supabase.from("blacklist_audit_log").insert({
      action: "remove_success",
      target_id: id,
      target_ip: targetIP,
      success: true,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
