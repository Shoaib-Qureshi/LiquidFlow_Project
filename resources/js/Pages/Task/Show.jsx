import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { USER_STATUS_CLASS_MAP, USER_STATUS_TEXT_MAP } from "@/constants.jsx";
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(route("comments.store"), {
        task_id: task.id,
        comment: newComment,
      });

      if (response.data.success) {
        setComments([...comments, response.data.comment]); // Add new comment to the list
        setNewComment(""); // Clear the input field
      }
    } catch (error) {
      console.error("Error submitting the comment:", error);
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
            className="btn-primary"
          >
            Edit
          </Link>
        </div>
      }
    >



      <Head title={`Task "${task.name}"`} />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="card-soft overflow-hidden">
            <div>
              <img
                src={task.image_path}
                alt=""
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="p-6">
              <div className="grid gap-1 grid-cols-2 mt-2">
                <div>
                  <div>
                    <label className="font-bold text-lg">Task ID</label>
                    <p className="mt-1">{task.id}</p>
                  </div>
                  <div className="mt-4">
                    <label className="font-bold text-lg">Task Name</label>
                    <p className="mt-1">{task.name}</p>
                  </div>

                  <div className="mt-4">
                    <label className="font-bold text-lg">Task Status</label>
                    <p className="mt-1">
                      <span
                        className={
                          "px-2 py-1 rounded text-white " +
                          TASK_STATUS_CLASS_MAP[task.status]
                        }
                      >
                        {TASK_STATUS_TEXT_MAP[task.status]}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="font-bold text-lg">Task Priority</label>
                    <p className="mt-1">
                      <span
                        className={
                          "px-2 py-1 rounded text-white " +
                          TASK_PRIORITY_CLASS_MAP[task.priority]
                        }
                      >
                        {TASK_PRIORITY_TEXT_MAP[task.priority]}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4">
                    <label className="font-bold text-lg">Created By</label>
                    <p className="mt-1">{task.createdBy.name}</p>
                  </div>
                </div>
                <div>
                  <div>
                    <label className="font-bold text-lg">Due Date</label>
                    <p className="mt-1">{task.due_date}</p>
                  </div>
                  <div className="mt-4">
                    <label className="font-bold text-lg">Create Date</label>
                    <p className="mt-1">{task.created_at}</p>
                  </div>
                  <div className="mt-4">
                    <label className="font-bold text-lg">Updated By</label>
                    <p className="mt-1">{task.updatedBy.name}</p>
                  </div>
                  <div className="mt-4">
                    <label className="font-bold text-lg">Brand</label>
                    <p className="mt-1">
                      {task.project ? (
                        <Link
                          href={route("project.show", task.project.id)}
                          className="hover:underline"
                        >
                          {task.project.name}
                        </Link>
                      ) : (
                        <span>{task.brand?.name || 'N/A'}</span>
                      )}
                    </p>
                  </div>
                  <div className="mt-4">
                    <label className="font-bold text-lg">Assigned User</label>
                    <p className="mt-1">{task.assignedUser?.name || 'Not assigned'}</p>
                  </div>
                  <div className="mt-4">
                    <label className="font-bold text-lg">Assigned By</label>
                    <p className="mt-1">{task.createdBy?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="font-bold text-lg">Task Description</label>
                <p className="mt-1">{task.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Comments section */}
      <div className="py-2">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="card-soft">
            <div className="mt-4 px-6 pb-2">
              <h3 className="font-bold text-lg">Comments</h3>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="mt-3 bg-slate-50	p-3 rounded">
                    <p className="text-sm text-gray-600">{comment.user.name}</p>
                    <p className="text-base">{comment.comment}</p>
                    <p className="text-xs text-gray-500">{comment.created_at}</p>
                  </div>
                ))
              ) : (
                <p>No comments yet.</p>
              )}
            </div>

            {/* Comment form */}
            <div className="mt-4 px-6 pb-6">
              <h3 className="font-bold text-lg">Add a Comment</h3>
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  name="comment"
                  className="form-input p-2 rounded w-full mt-2"
                  placeholder="Write your comment here..."
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <button
                  type="submit"
                  className="btn-primary mt-4"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

