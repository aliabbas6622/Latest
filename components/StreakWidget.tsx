import { motion } from 'framer-motion';
import { Flame, CheckCircle2 } from 'lucide-react';

interface StreakWidgetProps {
    currentStreak: number;
    longestStreak: number;
    attemptCount: number;
    threshold: number;
    isStreakDay: boolean;
}

export const StreakWidget = ({
    currentStreak,
    longestStreak,
    attemptCount,
    threshold,
    isStreakDay
}: StreakWidgetProps) => {
    const progress = Math.min((attemptCount / threshold) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isStreakDay ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'} dark:bg-slate-700`}>
                        <Flame className={`w-6 h-6 ${isStreakDay ? 'fill-orange-600 animate-pulse' : ''}`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Learning Streak</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Keep the fire burning!</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-black text-slate-800 dark:text-white">{currentStreak}</div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Days</div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Today's Progress
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                        {attemptCount} / {threshold} MCQs
                    </span>
                </div>

                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full rounded-full ${isStreakDay ? 'bg-gradient-to-r from-orange-500 to-amber-400' : 'bg-indigo-500'}`}
                    />
                </div>

                {isStreakDay ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium pt-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Streak extended for today!
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 pt-1">
                        Complete {threshold - attemptCount} more MCQs today to keep your streak.
                    </p>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">LONGEST STREAK</span>
                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-bold">
                    {longestStreak} DAYS
                </span>
            </div>
        </motion.div>
    );
};
