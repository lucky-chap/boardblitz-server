import type { User } from "@/common/types";

export interface IAuthService {
  //   getCurrentSession(userId: number): Promise<User | null>;
  loginUser(params: {
    data: {
      email: string;
      password: string;
    };
  }): Promise<User>;
  registerUser(params: {
    data: {
      name: string;
      email: string;
      password: string;
    };
  }): Promise<User>;
  updateGameParticipantName(params: {
    data: {
      sessionId: string;
      name: string;
    };
  }): Promise<void>;
}

// name: string, email: string, password: string
