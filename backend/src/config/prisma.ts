import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing in your .env file");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);


const prisma = new PrismaClient({ adapter });
export { prisma };
//Pool (from pg) - The Delivery Trucks:(it opens a set of no. of conection s, whenevr user req. data , server take the connection form this pool and use it )
//PrismaPg (the adapter) - The Translator:(it tell ethe postgress engine ( whihc i sheavy build is rust ) that translate my queries into standara dnodejs sql and execute using the pool conenction )
// PrismaClient - The Steering Wheel:
// (the client takes that JavaScript, hands it to the adapter to translate, which hands it to a truck in the pool to deliver to the Postgres database.)
