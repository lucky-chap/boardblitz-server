// import type { User } from "@/api/user/userModel";
import type { User } from "@/common/types";
import { pool } from "./index";

export class UserDelegate {
  async findMany(): Promise<User[]> {
    const result = await pool.query<User>(`SELECT id, name, email, wins, losses, draws FROM "user"`);
    return result.rows;
  }

  async findUnique({
    where: { id },
  }: {
    where: { id: number };
  }): Promise<User | null> {
    const result = await pool.query<User>(`SELECT id, name, email, wins, losses, draws FROM "user" WHERE id=$1`, [id]);
    return result.rows[0] || null;
  }

  async findByEmail({
    where: { email },
  }: {
    where: { email: string | undefined };
  }): Promise<User | null> {
    const result = await pool.query<User>(`SELECT id, name, email, wins, losses, draws FROM "user" WHERE email=$1`, [
      email,
    ]);
    return result.rows[0] || null;
  }

  async create({
    data,
  }: {
    data: Omit<User, "id" | "createdAt" | "updatedAt"> & { password: string };
  }): Promise<User | null> {
    if (data.name === "Guest" || data.email === undefined) {
      return null;
    }
    const result = await pool.query<User>(
      `INSERT INTO "user"(name, email, password) VALUES($1, $2, $3) RETURNING id, name, email, wins, losses, draws`,
      [data.name, data.email || null, data.password],
    );
    return result.rows[0] as User;
  }

  async update({
    where: { id },
    data,
  }: {
    where: { id: number };
    data: Partial<User> & { password?: string | undefined };
  }): Promise<User | null> {
    const setColumns = [];
    const values = [];
    let paramIndex = 1;

    if (id === 0) {
      return null;
    }

    if (data.name) {
      setColumns.push(`name = $${paramIndex}`);
      values.push(data.name);
      paramIndex++;
    }
    if (data.email) {
      setColumns.push(`email = $${paramIndex}`);
      values.push(data.email);
      paramIndex++;
    }

    if (data.password) {
      setColumns.push(`password = $${paramIndex}`);
      values.push(data.password);
      paramIndex++;
    }

    if (setColumns.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);
    const result = await pool.query<User>(
      `UPDATE "user" 
         SET ${setColumns.join(", ")}
         WHERE id = $${paramIndex} 
         RETURNING id, name, email, wins, losses, draws`,
      values,
    );
    return result.rows[0];
  }

  async delete({ where: { id } }: { where: { id: number } }): Promise<User> {
    const result = await pool.query<User>(
      `DELETE FROM "user" 
         WHERE id = $1 
         RETURNING id, name, email, created_at as createdAt, updated_at as updatedAt`,
      [id],
    );
    return result.rows[0];
  }
}
