import { Component, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-ai-assistant",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./ai-assistant.component.html",
  styleUrls: ["./ai-assistant.component.scss"]
})
export class AiAssistantComponent {

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // Backend API Base
  private API_BASE = 'http://localhost:8080/server/api';

  isOpen = false;
  userMessage = '';
  loading = false;

  messages: { text: string, type: 'user' | 'bot' }[] = [
    {
      text: 'Welcome to the AI Legal Assistant.\nAsk me anything about the repository.',
      type: 'bot'
    }
  ];

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {

    const input = this.userMessage?.trim();
    if (!input || this.loading) return;

    // Add user message to chat
    this.messages.push({ text: input, type: 'user' });

    this.userMessage = '';
    this.loading = true;

    this.cdr.detectChanges();

    // 🔥 Call AI Backend Endpoint
    this.http.post<any>(
      `${this.API_BASE}/diracai/ai/chat`,
      { message: input },
      { withCredentials: true }   // Important for CSRF
    ).subscribe({

      next: (response) => {

        const reply = response?.reply || 'No response from AI service.';

        this.messages.push({
          text: reply,
          type: 'bot'
        });

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error("AI error:", error);

        this.messages.push({
          text: '⚠ Unable to connect to AI service.',
          type: 'bot'
        });

        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}