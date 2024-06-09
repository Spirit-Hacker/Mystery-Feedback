import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
// import type { NextRequest } from "next/server";


export { default } from "next-auth/middleware";

export async function middleware(request: NextRequest){

    const token = await getToken({req: request});
    const url = request.nextUrl;

    if(token && (
        url.pathname.startsWith("/sign-in") ||
        url.pathname.startsWith("/sign-up") ||
        url.pathname.startsWith("/verify") ||
        url.pathname.startsWith("/")
        )
    ){
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
    matcher: [
        "/sign-in",
        "/sign-up",
        "/dashboard/:path*",
        "/verify/:path*"
    ]
}