import React, { useState, useContext } from 'react';
import type { Project, Plan } from '../types';
import { AppContext } from '../contexts/AppContext';

interface ProjectSettingsModalProps {
    project: Project;
    onClose: () => void;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ project, onClose }) => {
    const context = useContext(AppContext);
    const [projectName, setProjectName] = useState(project.name);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    if (!context) return null;

    const { updateProjectName, duplicateProject, deleteProject, user, projects } = context;

    const handleNameChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (projectName.trim() && projectName.trim() !== project.name) {
            updateProjectName(project.id, projectName.trim());
            alert('Project name updated!');
        }
    };

    const handleDuplicate = () => {
        if (!user) return;
        const planLimits: Record<Plan, number> = {
            Free: 2,
            Hobby: 5,
            Pro: 15,
            Enterprise: Infinity,
        };
        const currentPlanLimit = planLimits[user.plan] || 0;

        if (projects.length >= currentPlanLimit) {
            alert(`You have reached your project limit of ${currentPlanLimit} for the ${user.plan} plan. Please upgrade to create more projects.`);
            return;
        }

        duplicateProject(project.id);
        alert(`'${project.name}' has been duplicated.`);
        onClose();
    };

    const handleDelete = () => {
        deleteProject(project.id);
        onClose();
    };
    
    const isDeleteDisabled = deleteConfirmText.toLowerCase() !== project.name.toLowerCase();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg border border-primary/20 sm:animate-slide-in-top animate-slide-in-bottom" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Project Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                
                <div className="space-y-8">
                    {/* General Settings */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-200">General</h3>
                        <form onSubmit={handleNameChange} className="space-y-2">
                            <label htmlFor="projectName" className="text-sm font-medium text-gray-400">Project Name</label>
                            <div className="flex gap-2">
                                <input 
                                    id="projectName"
                                    type="text" 
                                    value={projectName} 
                                    onChange={e => setProjectName(e.target.value)} 
                                    className="w-full bg-gray-700 p-2 rounded-md focus:ring-2 focus:ring-primary outline-none"
                                />
                                <button type="submit" className="px-4 py-2 bg-primary rounded-md hover:bg-primary-hover transition text-sm font-semibold">Save</button>
                            </div>
                        </form>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-200">Actions</h3>
                        <div className="bg-gray-700/50 p-4 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-200">Duplicate Project</p>
                                <p className="text-xs text-gray-400">Create a complete copy of this project and its configuration.</p>
                            </div>
                            <button onClick={handleDuplicate} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md transition text-sm font-semibold">Duplicate</button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t border-red-500/30 pt-6">
                         <h3 className="font-semibold text-lg text-red-400">Danger Zone</h3>
                         <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-md mt-2 space-y-4">
                            <div>
                                <p className="font-medium text-gray-200">Delete this project</p>
                                <p className="text-xs text-gray-400 mb-2">Once you delete a project, there is no going back. Please be certain.</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-300">To confirm, type "<span className="font-bold text-white">{project.name}</span>" in the box below</label>
                                <input 
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={e => setDeleteConfirmText(e.target.value)}
                                    className="mt-1 w-full bg-gray-900 border border-red-500/50 p-2 rounded-md focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                             <button 
                                onClick={handleDelete} 
                                disabled={isDeleteDisabled}
                                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition text-sm font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                Delete Project
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectSettingsModal;
