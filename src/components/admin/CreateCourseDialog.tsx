import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Plus, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CourseFormData {
    title: string;
    description: string;
    price: number;
    instructor: string;
    level: string;
    duration: string;
    category: string;
    image_url: string;
}

export function CreateCourseDialog({ onCourseCreated }: { onCourseCreated: () => void }) {
    const { user, token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, setValue } = useForm<CourseFormData>();

    const onSubmit = async (data: CourseFormData) => {
        setIsLoading(true);
        try {
            // Basic validation
            if (Number(data.price) < 0) throw new Error("Price cannot be negative");

            const response = await fetch('/api/v1/payments/courses/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...data,
                    price: Number(data.price), // Ensure number
                    rating: 0,
                    tags: [],
                    details: {
                        toolsList: [],
                        projectsList: [],
                        learnings: [],
                        weeks: []
                    }
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to create course');
            }

            toast.success('Course created successfully!');
            setIsOpen(false);
            reset();
            onCourseCreated();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.role !== 'ADMIN') return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Create Course
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-neutral-900 border-neutral-800 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Course Title</Label>
                            <Input id="title" {...register('title', { required: true })} className="bg-neutral-800 border-neutral-700" placeholder="e.g. Master AI" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select onValueChange={(val) => setValue('category', val)}>
                                <SelectTrigger className="bg-neutral-800 border-neutral-700">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                                    <SelectItem value="Business">Business</SelectItem>
                                    <SelectItem value="AI Tools">AI Tools</SelectItem>
                                    <SelectItem value="Development">Development</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...register('description', { required: true })} className="bg-neutral-800 border-neutral-700 min-h-[100px]" placeholder="Detailed description..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input id="price" type="number" {...register('price', { required: true })} className="bg-neutral-800 border-neutral-700" placeholder="4999" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input id="duration" {...register('duration', { required: true })} className="bg-neutral-800 border-neutral-700" placeholder="e.g. 8 Weeks" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="instructor">Instructor Name</Label>
                            <Input id="instructor" {...register('instructor', { required: true })} className="bg-neutral-800 border-neutral-700" placeholder="e.g. Jane Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="level">Level</Label>
                            <Select onValueChange={(val) => setValue('level', val)}>
                                <SelectTrigger className="bg-neutral-800 border-neutral-700">
                                    <SelectValue placeholder="Select Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image_url">Image URL</Label>
                        <Input id="image_url" {...register('image_url')} className="bg-neutral-800 border-neutral-700" placeholder="https://..." />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="text-neutral-400">Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#ADFF44] text-black hover:bg-[#9BE63D]">
                            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : 'Create Course'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
