// Auth Types - Based on API documentation

export interface User {
  phone: string;
  name: string;
  role: "admin" | "owner" | "agent";
  status: "pending" | "approved" | "rejected";
  managedProperties?: string[]; // IDs of properties linked to agent
  createdAt: string;
  updatedAt: string;
}

// Send OTP
export interface SendOTPRequest {
  phone: string;
}

export interface SendOTPResponse {
  message: string;
  phone: string;
  code?: string; // Only returned in dev mode
}

// Verify OTP
export interface VerifyOTPRequest {
  phone: string;
  code: string;
  name?: string;
  role?: "admin" | "owner" | "agent";
}

export interface VerifyOTPResponse {
  token?: string;
  user: User;
  isNew: boolean;
  message: string;
}

// Password Login
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

// Set Password
export interface SetPasswordRequest {
  password: string;
  oldPassword?: string;
}

export interface SetPasswordResponse {
  message: string;
}

// Validate Invite Code
export interface ValidateInviteCodeRequest {
  code: string;
}

export interface ValidateInviteCodeResponse {
  valid: boolean;
  inviteCode?: unknown; // Property details/invite code
  message?: string;
}

// API Error Response
export interface APIError {
  error: string;
  message?: string;
  statusCode: number;
}

// Auth State for context
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Agent Management Types
export interface Agent {
  phone: string;
  name: string;
  role: "agent";
  status: "pending" | "approved" | "rejected";
  managedProperties: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentsListResponse {
  agents: Agent[];
  count: number;
}

export interface UpdateAgentStatusResponse {
  agent: Agent;
  message: string;
}
