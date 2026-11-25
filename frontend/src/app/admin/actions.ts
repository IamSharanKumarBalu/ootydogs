"use server";

import { cookies } from "next/headers";

export async function getAdminDashboardStats() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return null;

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
        const res = await fetch(`${baseUrl}/admin/stats`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store",
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.success ? data.stats : null;
    } catch {
        return null;
    }
}
