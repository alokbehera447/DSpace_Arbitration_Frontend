import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../core/auth/auth.service";

import { HostListener } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: "app-ai-assistant",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./ai-assistant.component.html",
  styleUrls: ["./ai-assistant.component.scss"]
})
export class AiAssistantComponent implements OnInit, AfterViewChecked {

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private sanitizer: DomSanitizer   // ✅ ADD THIS

  ) { }

  private API_BASE = "http://localhost:8080/server/api/diracai";

  isOpen = false;
  isExpanded = false;
  isLoggedIn = false;
  userMessage = "";
  loading = false;
  sessionId: string | null = null;

  sessions: any[] = [];
  showHistory = false;
  messages: { text: string; type: "user" | "bot" }[] = [
    { text: "Welcome to the AI Legal Assistant.\nAsk me anything.", type: "bot" }
  ];

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe((authenticated) => {
      this.isLoggedIn = authenticated;

      if (authenticated && !this.sessionId) {
        this.createSession();
      }

      if (!authenticated) {
        this.resetChat();
      }

      this.cdr.detectChanges();
    });
  }

  private resetChat(): void {
    this.isOpen = false;
    this.isExpanded = false;
    this.sessionId = null;

    this.messages = [
      { text: "Welcome to the AI Legal Assistant.\nAsk me anything.", type: "bot" }
    ];
  }

  private createSession(): void {
    this.http.post(`${this.API_BASE}/chat/session`, {}, {
      withCredentials: true,
      responseType: 'text' as 'json'
    }).subscribe((id: any) => {
      this.sessionId = id;

      this.messages = [
        { text: "New chat started. Ask something!", type: "bot" }
      ];
    });
  }

  // NEW CHAT
  startNewChat(): void {
    this.http.post(`${this.API_BASE}/chat/session/new`, {}, {
      withCredentials: true,
      responseType: 'text' as 'json'
    }).subscribe((id: any) => {
      this.sessionId = id;

      this.messages = [
        { text: "New chat started.", type: "bot" }
      ];

      this.loadSessions();
      this.cdr.detectChanges();
    });
  }

  // LOAD HISTORY LIST
  loadSessions(): void {
    this.http.get<any[]>(`${this.API_BASE}/chat/sessions`, {
      withCredentials: true
    }).subscribe((res) => {
      this.sessions = res;
      this.cdr.detectChanges();
    });
  }

  // SELECT SESSION
  selectSession(id: string): void {
    this.sessionId = id;
    this.messages = [];

    this.loadHistory();
  }

  // FIXED HISTORY
  private loadHistory(): void {
    if (!this.sessionId) return;

    this.http.get<any[]>(`${this.API_BASE}/chat/history?sessionId=${this.sessionId}`, {
      withCredentials: true
    }).subscribe((history) => {

      if (!history || history.length === 0) {
        this.messages = [
          { text: "No messages yet. Start chatting ", type: "bot" }
        ];
      } else {
        this.messages = history.map((msg) => ({
          text: msg.content,
          type: msg.role === "user" ? "user" : "bot"
        }));
      }

      this.cdr.detectChanges();
    });
  }

  // OPEN CHAT
  toggleChat(): void {
    if (!this.isLoggedIn) return;

    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.showHistory = false; // ✅ hide sidebar on open

      // ✅ reset chat (no previous messages)
      this.messages = [
        { text: "Orissa High Court AI Assistant.\nAsk me anything.", type: "bot" }
      ];
    }

    if (!this.isOpen) {
      this.isExpanded = false;
    }
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  sendMessage(): void {
    const input = this.userMessage.trim();
    if (!input || this.loading) return;

    this.messages.push({ text: input, type: "user" });
    this.userMessage = "";
    this.loading = true;

    this.http.post(`${this.API_BASE}/chat/ask?sessionId=${this.sessionId}`, input, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
      responseType: 'text' as 'json'
    }).subscribe((res: any) => {
      this.messages.push({ text: res || "No response", type: "bot" });
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  ngAfterViewChecked(): void {
    const el = document.querySelector(".chat-body");
    if (el) el.scrollTop = el.scrollHeight;
  }

  deleteSession(id: string, event: Event): void {
    event.stopPropagation();

    this.activeMenu = null;

    // remove from UI
    this.sessions = this.sessions.filter(s => s.id !== id);

    // if current session deleted → reset properly
    if (this.sessionId === id) {
      this.sessionId = null;

      // ✅ CLEAR CHAT COMPLETELY
      this.messages = [
        { text: "Orissa High Court AI Assistant.\nAsk me anything.", type: "bot" }
      ];

      // ✅ OPTIONAL (RECOMMENDED): auto create new session
      this.createSession();
    }

    this.cdr.detectChanges();

    // backend delete
    this.http.delete(`${this.API_BASE}/chat/session?sessionId=${id}`, {
      withCredentials: true
    }).subscribe();
  }


  activeMenu: string | null = null;

  toggleMenu(id: string): void {
    this.activeMenu = this.activeMenu === id ? null : id;
  }

  @HostListener('document:click')
  closeMenu() {
    this.activeMenu = null;
  }


  formatMessage(text: string): SafeHtml {
    if (!text) return '';

    // 🔥 Extract URL after "Source ="
    const match = text.match(/Source\s*=\s*(https?:\/\/[^\s]+)/i);

    let formatted = text;

    if (match) {
      const url = match[1];

      // 🔥 Replace full "Source = URL" with clean button
      formatted = text.replace(
        /Source\s*=\s*https?:\/\/[^\s]+/i,
        `<br><a href="${url}" target="_blank" class="case-btn">🔗 View Case</a>`
      );
    }

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;

    if (this.showHistory && this.sessions.length === 0) {
      this.loadSessions(); // ✅ load only when needed
    }
  }
}