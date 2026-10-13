import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_POLLINATIONS_KEY = "sk_ueAtw7LuBE1fqkn7tcKkHqViIhaYrsnE";

function getPollinationsKey(customKey) {
  if (customKey && typeof customKey === "string" && customKey.trim().length > 0) {
    return customKey.trim();
  }
  return process.env.POLLINATIONS_API_KEY || DEFAULT_POLLINATIONS_KEY;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customKey = searchParams.get("key") || "";
    const apiKey = getPollinationsKey(customKey);

    if (!apiKey) {
      return NextResponse.json(
        { error: "No Pollinations API key configured", balance: null },
        { status: 400 }
      );
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    const [balanceRes, profileRes] = await Promise.all([
      fetch("https://gen.pollinations.ai/account/balance", {
        headers,
        cache: "no-store",
      }).catch((err) => ({ ok: false, error: err.message })),
      fetch("https://gen.pollinations.ai/account/profile", {
        headers,
        cache: "no-store",
      }).catch(() => ({ ok: false })),
    ]);

    let balanceData = null;
    if (balanceRes && balanceRes.ok) {
      balanceData = await balanceRes.json().catch(() => null);
    }

    let profileData = null;
    if (profileRes && profileRes.ok) {
      profileData = await profileRes.json().catch(() => null);
    }

    if (!balanceData) {
      return NextResponse.json({
        success: false,
        error: "Failed to fetch Pollinations balance",
        balance: null,
      });
    }

    const balanceNum = typeof balanceData.balance === "number" ? balanceData.balance : 0;
    const accountBalance = balanceData.accountBalance || {};

    return NextResponse.json({
      success: true,
      balance: balanceNum,
      formatted: balanceNum.toFixed(3),
      total: accountBalance.total ?? balanceNum,
      tier: accountBalance.tier ?? balanceNum,
      paid: accountBalance.paid ?? 0,
      profile: profileData
        ? {
            username: profileData.githubUsername || "",
            name: profileData.name || "",
            email: profileData.email || "",
            image: profileData.image || "",
          }
        : null,
    });
  } catch (error) {
    console.error("Pollinations credits fetch error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch credits", balance: null },
      { status: 500 }
    );
  }
}
