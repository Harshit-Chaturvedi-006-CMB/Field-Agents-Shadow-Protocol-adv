import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; // Import uuid

export async function POST(request) {
  const { username, email, password } = await request.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("userdata");

    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate UUIDv4 for user id
    const id = uuidv4();

    // Default user balance
    const userBalance = 0;

    await db.collection("users").insertOne({
      id,
      username,
      email,
      password: hashedPassword,
      userBalance,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "User created successfully", id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
