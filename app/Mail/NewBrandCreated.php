<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Project;

class NewBrandCreated extends Mailable
{
    use Queueable, SerializesModels;

    public $project;

    /**
     * Create a new message instance.
     */
    public function __construct(Project $project)
    {
        $this->project = $project;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('New Brand Created: ' . ($this->project->name ?? ''))
            ->view('emails.new_brand_created')
            ->with(['project' => $this->project]);
    }
}
