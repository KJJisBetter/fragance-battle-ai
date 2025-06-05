import { query } from '../config/database';

export interface TestSession {
  id: string;
  userId: string;
  sessionName?: string;
  isBlindTest: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface TestResult {
  id: string;
  sessionId: string;
  category: string;
  selectedFragrances: string[];
  maxSelections: number;
  createdAt: Date;
}

export class TestResultModel {
  static async createSession(userId: string, sessionName?: string, isBlindTest = true): Promise<TestSession> {
    const result = await query(`
      INSERT INTO test_sessions (user_id, session_name, is_blind_test)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [userId, sessionName, isBlindTest]);

    return this.mapDbToSession(result.rows[0]);
  }

  static async addResult(sessionId: string, category: string, selectedFragrances: string[], maxSelections: number): Promise<TestResult> {
    const result = await query(`
      INSERT INTO test_results (session_id, category, selected_fragrances, max_selections)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [sessionId, category, selectedFragrances, maxSelections]);

    return this.mapDbToResult(result.rows[0]);
  }

  static async getSessionResults(sessionId: string): Promise<TestResult[]> {
    const result = await query(
      'SELECT * FROM test_results WHERE session_id = $1 ORDER BY created_at',
      [sessionId]
    );
    return result.rows.map(this.mapDbToResult);
  }

  static async getUserSessions(userId: string): Promise<TestSession[]> {
    const result = await query(
      'SELECT * FROM test_sessions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map(this.mapDbToSession);
  }

  static async completeSession(sessionId: string): Promise<void> {
    await query(
      'UPDATE test_sessions SET completed_at = CURRENT_TIMESTAMP WHERE id = $1',
      [sessionId]
    );
  }

  private static mapDbToSession(row: any): TestSession {
    return {
      id: row.id,
      userId: row.user_id,
      sessionName: row.session_name,
      isBlindTest: row.is_blind_test,
      createdAt: row.created_at,
      completedAt: row.completed_at
    };
  }

  private static mapDbToResult(row: any): TestResult {
    return {
      id: row.id,
      sessionId: row.session_id,
      category: row.category,
      selectedFragrances: row.selected_fragrances || [],
      maxSelections: row.max_selections,
      createdAt: row.created_at
    };
  }
}
