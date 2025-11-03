import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
  TASK_PRIORITY_CLASS_MAP,
  TASK_PRIORITY_TEXT_MAP,
  TASK_STATUS_CLASS_MAP,
  TASK_STATUS_TEXT_MAP,
} from "@/constants.jsx";
import { useState } from "react";
import axios from "axios";


export default function Show({ auth, task, initialComments }) { // Accept initialComments as a prop
  const [comments, setComments] = useState(initialComments || []); // Initialize with comments from backend
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);

    try {
      const response = await axios.post(route("comments.store"), {
        task_id: task.id,
        comment: newComment,
      });

      if (response.data.success) {
        // Append the returned comment object (server should return saved comment)
        setComments((prev) => [...prev, response.data.comment]);
        setNewComment(""); // Clear the input field
      }
    } catch (error) {
      console.error("Error submitting the comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {`Task "${task.name}"`}
          </h2>
          <Link
            href={route("task.edit", task.id)}
            className="bg-emerald-500 py-1 px-3 text-white rounded shadow transition-all hover:bg-emerald-600"
          >
            Edit
          </Link>
        </div>
      }
    >



      <Head title={`Task "${task.name}"`} />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            {task.image_path && (
              <div className="w-full h-64 overflow-hidden">
                <img
                  src={task.image_path}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div>
                  <div>
                    <label className="font-semibold text-sm text-gray-600">Task ID</label>
                    <p className="mt-1 text-lg font-medium">{task.id}</p>
                  </div>
                  <div className="mt-4">
                    <label className="font-semibold text-sm text-gray-600">Task Name</label>
                    <p className="mt-1 text-xl font-semibold">{task.name}</p>
                  </div>

                  <div className="mt-4">
                    <label className="font-semibold text-sm text-gray-600">Task Status</label>
                    <p className="mt-2">
                      <span
                        className={
                          "inline-block px-3 py-1 rounded-full text-white text-sm " +
                          TASK_STATUS_CLASS_MAP[task.status]
                        }
                      >
                        {TASK_STATUS_TEXT_MAP[task.status]}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="font-semibold text-sm text-gray-600">Task Priority</label>
                    <p className="mt-2">
                      <span
                        className={
                          "inline-block px-3 py-1 rounded-full text-white text-sm " +
                          TASK_PRIORITY_CLASS_MAP[task.priority]
                        }
                      >
                        {TASK_PRIORITY_TEXT_MAP[task.priority]}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4">
                    <label className="font-semibold text-sm text-gray-600">Created By</label>
                    <p className="mt-1 text-sm">{task.createdBy.name}</p>
                  </div>
                </div>
                <div>
                  <div>
                    <label className="font-semibold text-sm text-gray-600">Due Date</label>
                    <p className="mt-1 text-sm">{task.due_date}</p>
                  </div>
                  <div className="mt-4">
                    <label className="font-semibold text-sm text-gray-600">Create Date</label>
                    <p className="mt-1 text-sm">{task.created_at}</p>
                  </div>
                  <div className="mt-4">
                    <label className="font-semibold text-sm text-gray-600">Updated By</label>
                    <p className="mt-1 text-sm">{task.updatedBy.name}</p>
                  </div>
                  <div className="mt-4">
                    <label className="font-semibold text-sm text-gray-600">Brand</label>
                    <p className="mt-1 text-sm">
                      {task.project ? (
                        <Link
                          href={route("project.show", task.project.id)}
                          className="text-emerald-600 hover:underline"
                        >
                          {task.project.name}
                        </Link>
                      ) : (
                        <span>{task.brand?.name || 'N/A'}</span>
                      )}
                    </p>
                  </div>
                  <div className="mt-4">
                    <label className="font-semibold text-sm text-gray-600">Team Member Assignment</label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-sm text-align-left">
                        <span className="text-gray-600 w-32">Assigned To:</span>
                        <span className={` py-1 ${task.assignedUser?.name ? 'text-emerald-700 font-medium' : 'text-gray-500 italic'}`}>
                          {task.assignedUser?.name || 'Not assigned'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 w-32">Assigned By:</span>
                        <span className="text-emerald-700">
                          {task.createdBy?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 w-32">Last Updated:</span>
                        <span className="text-gray-800">
                          {task.updated_at} by {task.updatedBy?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="font-semibold text-sm text-gray-600">Task Description</label>
                <p className="mt-2 text-base leading-relaxed text-gray-700">{task.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Comments section */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden p-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Comments</h3>

              {comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-slate-50 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-700 font-medium">{comment.user.name}</p>
                          <p className="text-xs text-gray-500">{comment.created_at}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-800">{comment.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No comments yet.</p>
              )}
            </div>

            {/* Comment form */}
            <div className="mt-6">
              <h4 className="font-semibold text-sm">Add a Comment</h4>
              <form onSubmit={handleCommentSubmit} className="mt-2">
                <textarea
                  name="comment"
                  className="border p-3 rounded w-full mt-2 min-h-[80px] resize-none"
                  placeholder="Write your comment here..."
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <div className="mt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="px-3 py-2 border rounded text-sm"
                    onClick={() => setNewComment("")}
                    disabled={isSubmittingComment}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded text-white bg-emerald-600 hover:bg-emerald-700 text-sm ${isSubmittingComment ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={isSubmittingComment}
                  >
                    {isSubmittingComment ? 'Posting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

