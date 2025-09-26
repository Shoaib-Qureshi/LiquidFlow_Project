import { useState, useEffect } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

export default function TaskDependencies({ task, className = '' }) {
    const [dependencies, setDependencies] = useState({
        blocked_by: [],
        blocking: [],
        is_blocked: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [availableTasks, setAvailableTasks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchDependencies();
        fetchAvailableTasks();
    }, [task.id]);

    const fetchDependencies = async () => {
        try {
            const response = await axios.get(route('task.dependencies', task.id));
            setDependencies(response.data);
            setSelectedTasks(response.data.blocked_by.map(t => t.id));
        } catch (err) {
            setError('Failed to load dependencies');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableTasks = async () => {
        try {
            // Filter out the current task and its dependent tasks
            const response = await axios.get(route('task.index'));
            const tasks = response.data.data.filter(t =>
                t.id !== task.id &&
                !dependencies.blocking.find(bt => bt.id === t.id)
            );
            setAvailableTasks(tasks);
        } catch (err) {
            setError('Failed to load available tasks');
        }
    };

    const handleTaskToggle = (taskId) => {
        setSelectedTasks(prev => {
            const isSelected = prev.includes(taskId);
            return isSelected
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId];
        });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await axios.put(route('task.dependencies.update', task.id), {
                dependencies: selectedTasks,
            });
            await fetchDependencies();
            await fetchAvailableTasks();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update dependencies');
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = availableTasks.filter(task =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div>Loading dependencies...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className={`space-y-4 ${className}`}>
            <div>
                <h3 className="text-lg font-medium">Task Dependencies</h3>
                {dependencies.is_blocked && (
                    <div className="mt-2 text-red-600">
                        This task is blocked by incomplete dependencies
                    </div>
                )}
            </div>

            {/* Blocked By Tasks */}
            <div>
                <h4 className="font-medium">Blocked By</h4>
                <div className="mt-2 space-y-2">
                    {dependencies.blocked_by.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                                <span className="font-medium">{task.name}</span>
                                <span className="ml-2 text-sm text-gray-500">
                                    {task.assigned_user?.name}
                                </span>
                            </div>
                            <span className={`px-2 py-1 text-sm rounded ${task.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {task.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Blocking Tasks */}
            <div>
                <h4 className="font-medium">Blocking</h4>
                <div className="mt-2 space-y-2">
                    {dependencies.blocking.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                                <span className="font-medium">{task.name}</span>
                                <span className="ml-2 text-sm text-gray-500">
                                    {task.assigned_user?.name}
                                </span>
                            </div>
                            <span className={`px-2 py-1 text-sm rounded ${task.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {task.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Dependencies */}
            <div>
                <h4 className="font-medium">Add Dependencies</h4>
                <div className="mt-2">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="w-full px-3 py-2 border rounded"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="mt-2 max-h-60 overflow-y-auto border rounded">
                    {filteredTasks.map(task => (
                        <label
                            key={task.id}
                            className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedTasks.includes(task.id)}
                                onChange={() => handleTaskToggle(task.id)}
                                className="rounded border-gray-300"
                            />
                            <span className="ml-2">{task.name}</span>
                            <span className="ml-2 text-sm text-gray-500">
                                {task.assigned_user?.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Dependencies'}
                </button>
            </div>
        </div>
    );
}