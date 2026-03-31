import { useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react';
import { mockData } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { tasks, projects, currentUser } = mockData;
  
  const upcomingTasks = tasks
    .filter(t => t.columnId !== 'col4') // Not Done
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: BarChart3, color: 'blue' },
    { label: 'In Progress', value: tasks.filter(t => t.columnId === 'col2').length, icon: Clock, color: 'yellow' },
    { label: 'Completed', value: tasks.filter(t => t.columnId === 'col4').length, icon: CheckCircle2, color: 'green' },
    { label: 'High Priority', value: tasks.filter(t => t.priority === 'High').length, icon: AlertCircle, color: 'red' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Welcome back, {currentUser.name}! 👋</h1>
        <p className="text-gray-500 dark:text-zinc-400">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-zinc-100">{stat.value}</p>
              </div>
              <div className={`rounded-lg bg-${stat.color}-50 p-3 text-${stat.color}-600 dark:bg-${stat.color}-900/20 dark:text-${stat.color}-400`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upcoming Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Upcoming Deadlines</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">View All</Button>
          </div>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div 
                key={task.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-blue-200 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-blue-900"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-full",
                    task.priority === 'High' ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  )}>
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{task.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      {projects.find(p => p.id === task.projectId)?.name} • Due {formatDate(task.dueDate)}
                    </p>
                  </div>
                </div>
                <Badge variant={task.priority === 'High' ? 'danger' : 'default'}>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Recent Projects</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {projects.map((project) => (
              <Link 
                key={project.id}
                to={`/project/${project.id}`}
                className="group block rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-blue-200 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-blue-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full bg-${project.color}-500`} />
                    <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{project.name}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors dark:text-zinc-600 dark:group-hover:text-blue-400" />
                </div>
                <div className="mt-3 flex -space-x-2">
                  {project.members.map((mId) => {
                    const member = mockData.users.find(u => u.id === mId);
                    return (
                      <img
                        key={mId}
                        src={member?.avatarUrl}
                        alt={member?.name}
                        className="h-7 w-7 rounded-full border-2 border-white bg-gray-100"
                        referrerPolicy="no-referrer"
                      />
                    );
                  })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
