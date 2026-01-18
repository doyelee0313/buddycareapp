import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { CaregiverNav } from '@/components/caregiver/CaregiverNav';
import { Mission } from '@/types/app';

const missionIcons = ['💊', '🍽', '🤸', '😊', '💧', '🛏', '📖', '🧘'];

export default function CaregiverMissions() {
  const { elderlyProfile, updateMission } = useApp();
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSaveEdit = () => {
    if (editingMission) {
      updateMission(editingMission);
      setEditingMission(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-top">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mission Editor</h1>
            <p className="text-muted-foreground">Customize daily activities</p>
          </div>
          <motion.button
            className="bg-caregiver-primary text-white p-3 rounded-2xl"
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </motion.div>

        {/* Info Card */}
        <motion.div 
          className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-blue-700 text-sm">
            💡 Customize missions based on the user's current condition. For example, replace "10,000 steps" with "Seated leg lifts" if they have leg pain.
          </p>
        </motion.div>

        {/* Missions List */}
        <div className="space-y-4">
          {elderlyProfile.missions.map((mission, index) => (
            <motion.div
              key={mission.id}
              className="bg-card rounded-3xl p-5 shadow-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{mission.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg">{mission.title}</h3>
                    {mission.time && (
                      <p className="text-muted-foreground text-sm">Scheduled: {mission.time}</p>
                    )}
                  </div>
                </div>
                <motion.button
                  className="p-3 bg-muted rounded-xl"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingMission(mission)}
                >
                  <Edit2 className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingMission && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingMission(null)}
          >
            <motion.div
              className="bg-card w-full max-w-lg rounded-t-[2rem] p-6 safe-area-bottom"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Edit Mission</h2>
                <motion.button
                  className="p-2 bg-muted rounded-full"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingMission(null)}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Icon Selector */}
              <div className="mb-6">
                <label className="font-semibold text-sm text-muted-foreground mb-2 block">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {missionIcons.map((icon) => (
                    <motion.button
                      key={icon}
                      className={`text-3xl p-3 rounded-xl ${
                        editingMission.icon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'
                      }`}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditingMission({ ...editingMission, icon })}
                    >
                      {icon}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="mb-6">
                <label className="font-semibold text-sm text-muted-foreground mb-2 block">Title</label>
                <input
                  type="text"
                  value={editingMission.title}
                  onChange={(e) => setEditingMission({ ...editingMission, title: e.target.value })}
                  className="w-full bg-muted rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Time Input */}
              <div className="mb-8">
                <label className="font-semibold text-sm text-muted-foreground mb-2 block">Scheduled Time (optional)</label>
                <input
                  type="text"
                  value={editingMission.time || ''}
                  onChange={(e) => setEditingMission({ ...editingMission, time: e.target.value })}
                  placeholder="e.g., 9:00 AM"
                  className="w-full bg-muted rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  className="flex-1 bg-muted text-muted-foreground py-4 rounded-2xl font-semibold"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditingMission(null)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="flex-1 bg-caregiver-primary text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveEdit}
                >
                  <Save className="w-5 h-5" />
                  Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CaregiverNav />
    </div>
  );
}
