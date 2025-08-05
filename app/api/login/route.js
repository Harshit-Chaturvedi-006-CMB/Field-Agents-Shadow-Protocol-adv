import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { emailOrUsername, password } = await request.json();

  if (!emailOrUsername || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
   const db = client.db("userdata");


    const user = await db.collection("users").findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Note: implement sessions or tokens here for real auth
   return NextResponse.json(
  {
    message: "Login successful",
    username: user.username,
    email: user.email,        // 👈 include this!
  },
  { status: 200 }
);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
