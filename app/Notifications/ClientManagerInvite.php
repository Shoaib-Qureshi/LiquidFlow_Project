<?php

namespace App\Notifications;

use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClientManagerInvite extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Client $client,
        protected string $temporaryPassword,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $loginUrl = url('/login');

        return (new MailMessage)
            ->subject('Your LiquidFlow access is ready')
            ->view('emails.manager_invite', [
                'user' => $notifiable,
                'client' => $this->client,
                'temporaryPassword' => $this->temporaryPassword,
                'loginUrl' => $loginUrl,
            ]);
    }
}
