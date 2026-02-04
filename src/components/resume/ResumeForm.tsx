import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical, User, Briefcase, GraduationCap, Code, FolderGit2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

const ResumeForm = () => {
    const { resumeData, updatePersonal, addExperience, updateExperience, removeExperience, addEducation, updateEducation, removeEducation, updateSkills, addProject, updateProject, removeProject } = useResume();
    const [activeTab, setActiveTab] = useState("personal");

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        // console.log('Dragged', active.id, 'over', over?.id); // Implement reorder logic if needed in context
    };

    const tabs = [
        { id: "personal", label: "Personal", icon: User },
        { id: "experience", label: "Experience", icon: Briefcase },
        { id: "education", label: "Education", icon: GraduationCap },
        { id: "skills", label: "Skills", icon: Code },
        { id: "projects", label: "Projects", icon: FolderGit2 },
    ];

    const goToNext = () => {
        const currIdx = tabs.findIndex(t => t.id === activeTab);
        if (currIdx < tabs.length - 1) setActiveTab(tabs[currIdx + 1].id);
    };

    const goToPrev = () => {
        const currIdx = tabs.findIndex(t => t.id === activeTab);
        if (currIdx > 0) setActiveTab(tabs[currIdx - 1].id);
    };

    // Calculate Score
    const calculateScore = () => {
        let score = 0;
        if (resumeData.personal.fullName) score += 10;
        if (resumeData.personal.email) score += 10;
        if (resumeData.personal.bio) score += 10;
        if (resumeData.experience.length > 0) score += 20;
        if (resumeData.education.length > 0) score += 20;
        if (resumeData.skills.length > 0) score += 15;
        if (resumeData.projects.length > 0) score += 15;
        return score;
    };

    return (
        <div className="space-y-6">
            {/* Resume Score */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">Resume Strength</h4>
                        <p className="text-xs text-gray-500">Aim for 100% to increase interview chances</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-1/3">
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                            style={{ width: `${calculateScore()}%` }}
                        />
                    </div>
                    <span className="font-bold text-sm text-purple-700">{calculateScore()}%</span>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 text-xs md:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all"
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden md:inline">{tab.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="min-h-[400px]">
                    {/* 1. Personal Details */}
                    <TabsContent value="personal" className="mt-0">
                        <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={resumeData.personal.fullName} onChange={(e) => updatePersonal('fullName', e.target.value)} placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={resumeData.personal.email} onChange={(e) => updatePersonal('email', e.target.value)} placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input value={resumeData.personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} placeholder="+1 234 567 890" />
                                </div>
                                <div className="space-y-2">
                                    <Label>LinkedIn / Website</Label>
                                    <Input value={resumeData.personal.linkedin} onChange={(e) => updatePersonal('linkedin', e.target.value)} placeholder="linkedin.com/in/johndoe" />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Professional Summary</Label>
                                        <Button variant="ghost" size="sm" className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                            <Sparkles className="w-3 h-3 mr-1" /> AI Write
                                        </Button>
                                    </div>
                                    <Textarea value={resumeData.personal.bio} onChange={(e) => updatePersonal('bio', e.target.value)} placeholder="Briefly describe your professional background..." className="min-h-[100px]" />
                                </div>
                            </div>
                        </section>
                    </TabsContent>

                    {/* 2. Experience */}
                    <TabsContent value="experience" className="mt-0">
                        <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Experience</h3>
                                <Button variant="outline" size="sm" onClick={addExperience}><Plus className="w-4 h-4 mr-2" /> Add Job</Button>
                            </div>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={resumeData.experience.map(e => e.id)} strategy={verticalListSortingStrategy}>
                                    <Accordion type="single" collapsible className="w-full space-y-2">
                                        {resumeData.experience.map((exp) => (
                                            <SortableExperienceItem
                                                key={exp.id}
                                                exp={exp}
                                                updateExperience={updateExperience}
                                                removeExperience={removeExperience}
                                            />
                                        ))}
                                    </Accordion>
                                </SortableContext>
                            </DndContext>
                        </section>
                    </TabsContent>

                    {/* 3. Education - Only minor fix to ensure proper re-rendering handling if needed, but structure is ok */}
                    <TabsContent value="education" className="mt-0">
                        <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Education</h3>
                                <Button variant="outline" size="sm" onClick={addEducation}><Plus className="w-4 h-4 mr-2" /> Add Education</Button>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                {resumeData.education.map((edu, index) => (
                                    <AccordionItem key={edu.id} value={edu.id}>
                                        <AccordionTrigger className="hover:no-underline"><span className="font-medium">{edu.degree || '(No Degree)'}</span></AccordionTrigger>
                                        <AccordionContent className="pt-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2"><Label>Degree</Label><Input value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="B.S. CS" /></div>
                                                <div className="space-y-2"><Label>School</Label><Input value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} placeholder="Stanford" /></div>
                                                <div className="space-y-2"><Label>Year</Label><Input value={edu.gradYear} onChange={(e) => updateEducation(edu.id, 'gradYear', e.target.value)} placeholder="2024" /></div>
                                                <div className="space-y-2"><Label>Location</Label><Input value={edu.location} onChange={(e) => updateEducation(edu.id, 'location', e.target.value)} placeholder="CA, USA" /></div>
                                            </div>
                                            <Button variant="destructive" size="sm" onClick={() => removeEducation(edu.id)} className="w-full mt-2"><Trash2 className="w-4 h-4 mr-2" /> Remove</Button>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </section>
                    </TabsContent>

                    {/* 4. Skills */}
                    <TabsContent value="skills" className="mt-0">
                        <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Skills</h3>
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50" onClick={() => updateSkills([...resumeData.skills, "Python", "React", "Leadership"])}>
                                    <Sparkles className="w-3 h-3 mr-1" /> Suggest Skills
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label>List your skills (comma separated)</Label>
                                <Textarea value={resumeData.skills.join(', ')} onChange={(e) => updateSkills(e.target.value.split(',').map(s => s.trim()))} placeholder="React, TypeScript, Node.js, Python..." className="min-h-[150px]" />
                            </div>
                        </section>
                    </TabsContent>

                    {/* 5. Projects */}
                    <TabsContent value="projects" className="mt-0">
                        <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Projects</h3>
                                <Button variant="outline" size="sm" onClick={addProject}><Plus className="w-4 h-4 mr-2" /> Add Project</Button>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                {resumeData.projects.map((proj, index) => (
                                    <AccordionItem key={proj.id} value={proj.id}>
                                        <AccordionTrigger className="hover:no-underline"><span className="font-medium">{proj.name || '(No Name)'}</span></AccordionTrigger>
                                        <AccordionContent className="pt-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2"><Label>Name</Label><Input value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} placeholder="Project Name" /></div>
                                                <div className="space-y-2"><Label>Link</Label><Input value={proj.link} onChange={(e) => updateProject(proj.id, 'link', e.target.value)} placeholder="github.com/..." /></div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label>Description</Label>
                                                    <Button variant="ghost" size="sm" className="h-5 text-[10px] text-purple-600">
                                                        <Sparkles className="w-3 h-3 mr-1" /> AI Enhance
                                                    </Button>
                                                </div>
                                                <Textarea value={proj.description} onChange={(e) => updateProject(proj.id, 'description', e.target.value)} placeholder="Description..." />
                                            </div>
                                            <Button variant="destructive" size="sm" onClick={() => removeProject(proj.id)} className="w-full mt-2"><Trash2 className="w-4 h-4 mr-2" /> Remove</Button>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </section>
                    </TabsContent>

                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 mt-6 border-t border-gray-200 dark:border-gray-800">
                    <Button variant="outline" onClick={goToPrev} disabled={activeTab === 'personal'}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                    </Button>
                    <Button onClick={goToNext} disabled={activeTab === 'projects'}>
                        Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </Tabs>
        </div>
    );
};

// Helper Sortable Item - MOVED OUTSIDE to prevent focus loss
const SortableExperienceItem = ({ exp, updateExperience, removeExperience }: { exp: any, updateExperience: any, removeExperience: any }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: exp.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="mb-2 touch-none">
            <AccordionItem value={exp.id} className="border rounded-lg bg-slate-50 dark:bg-slate-800/50 px-2 overflow-hidden">
                <div className="flex items-center">
                    <button {...attributes} {...listeners} className="p-3 cursor-grab hover:text-purple-600 active:cursor-grabbing">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    <AccordionTrigger className="hover:no-underline flex-1 py-3 pr-4">
                        <span className="font-medium text-sm">{exp.role || '(No Role)'} <span className="text-gray-400 font-normal">at</span> {exp.company || '(No Company)'}</span>
                    </AccordionTrigger>
                </div>
                <AccordionContent className="pt-0 pb-4 px-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} placeholder="Software Engineer" />
                        </div>
                        <div className="space-y-2">
                            <Label>Company</Label>
                            <Input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Google" />
                        </div>
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="Jan 2022" />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="Present" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Description (Bullet Points)</Label>
                            <Button variant="ghost" size="sm" className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                <Sparkles className="w-3 h-3 mr-1" /> AI Enhance
                            </Button>
                        </div>
                        <Textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            placeholder="• Developed X using Y..."
                            className="min-h-[120px]"
                        />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => removeExperience(exp.id)} className="w-full mt-2">
                        <Trash2 className="w-4 h-4 mr-2" /> Remove Position
                    </Button>
                </AccordionContent>
            </AccordionItem>
        </div>
    );
};

export default ResumeForm;
