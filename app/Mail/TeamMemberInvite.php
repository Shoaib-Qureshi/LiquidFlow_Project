<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TeamMemberInvite extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $temporaryPassword
    ) {
    }

    public function build(): self
    {
        return $this->subject('You\'re invited to LiquidFlow')
            ->view('emails.team_member_invite', [
                'user' => $this->user,
                'temporaryPassword' => $this->temporaryPassword,
                'loginUrl' => url('/login'),
            ]);
    }
}
