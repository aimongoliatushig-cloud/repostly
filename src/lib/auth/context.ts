import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import type {
  Database,
  TableRow,
} from "@/lib/supabase/database.types";
import { createClient } from "@/utils/supabase/server";

type SubscriptionWithPlan = TableRow<"brand_subscriptions"> & {
  subscription_plans: TableRow<"subscription_plans"> | null;
};

export type BrandContext = {
  supabase: SupabaseClient<Database>;
  user: User;
  profile: TableRow<"profiles"> | null;
  membership: TableRow<"brand_memberships">;
  brand: TableRow<"brands">;
  subscription: SubscriptionWithPlan | null;
};

export function getAuthRedirectUrl(nextPath: string, error?: string) {
  const params = new URLSearchParams();

  if (nextPath) {
    params.set("next", nextPath);
  }

  if (error) {
    params.set("error", error);
  }

  return `/auth?${params.toString()}`;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentMembership(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("brand_memberships")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) {
    throw error;
  }

  const membership = (data?.[0] as TableRow<"brand_memberships"> | undefined) ?? null;

  if (!membership) {
    return null;
  }

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("*")
    .eq("id", membership.brand_id)
    .single();

  if (brandError) {
    throw brandError;
  }

  return {
    membership,
    brand: brand as TableRow<"brands">,
  };
}

export async function getCurrentBrandContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: profile, error: profileError }, membershipState] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    getCurrentMembership(supabase, user.id),
  ]);

  if (profileError) {
    throw profileError;
  }

  if (!membershipState) {
    return {
      supabase,
      user,
      profile: (profile as TableRow<"profiles"> | null) ?? null,
      membership: null,
      brand: null,
      subscription: null,
    };
  }

  const { data: subscriptionRows, error: subscriptionError } = await supabase
    .from("brand_subscriptions")
    .select("*")
    .eq("brand_id", membershipState.brand.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  if (subscriptionError) {
    throw subscriptionError;
  }

  const subscription =
    (subscriptionRows?.[0] as TableRow<"brand_subscriptions"> | undefined) ?? null;
  let subscriptionWithPlan: SubscriptionWithPlan | null = null;

  if (subscription) {
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", subscription.plan_id)
      .maybeSingle();

    if (planError) {
      throw planError;
    }

    subscriptionWithPlan = {
      ...subscription,
      subscription_plans: (plan as TableRow<"subscription_plans"> | null) ?? null,
    };
  }

  return {
    supabase,
    user,
    profile: (profile as TableRow<"profiles"> | null) ?? null,
    membership: membershipState.membership,
    brand: membershipState.brand,
    subscription: subscriptionWithPlan,
  };
}

export async function requireBrandContext(nextPath = "/dashboard") {
  const context = await getCurrentBrandContext();

  if (!context?.user) {
    redirect(getAuthRedirectUrl(nextPath));
  }

  if (!context.membership || !context.brand) {
    redirect(getAuthRedirectUrl(nextPath, "brand-context"));
  }

  return context as BrandContext;
}
