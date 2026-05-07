'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  X, 
  Settings, 
  Save,
  Trash2,
  Clock,
  Globe
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  keywords: string[];
  sources: string[];
  latency_config: {
    real_time: boolean;
    batch_interval_hours: number;
  };
  created_at: string;
  updated_at: string;
}

export function ProjectConfig() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [newSource, setNewSource] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/projects');
      
      // Mock data for now
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Diabetes Drug Monitoring',
          keywords: ['metformin', 'insulin', 'glipizide', 'hypoglycemia', 'hyperglycemia'],
          sources: ['Reddit', 'Practo', 'LocalCircles'],
          latency_config: {
            real_time: true,
            batch_interval_hours: 1
          },
          created_at: '2024-05-01T10:00:00Z',
          updated_at: '2024-05-10T15:30:00Z'
        },
        {
          id: '2',
          name: 'Cardiovascular Drug Safety',
          keywords: ['atorvastatin', 'amlodipine', 'losartan', 'atenolol', 'palpitations', 'chest pain'],
          sources: ['Twitter/X', 'Quora', 'Practo'],
          latency_config: {
            real_time: false,
            batch_interval_hours: 4
          },
          created_at: '2024-05-02T14:20:00Z',
          updated_at: '2024-05-11T09:15:00Z'
        },
        {
          id: '3',
          name: 'Antibiotic Adverse Reactions',
          keywords: ['azithromycin', 'amoxicillin', 'ciprofloxacin', 'doxycycline', 'allergy', 'rash'],
          sources: ['Reddit', 'Twitter/X', 'Quora'],
          latency_config: {
            real_time: true,
            batch_interval_hours: 2
          },
          created_at: '2024-05-03T16:45:00Z',
          updated_at: '2024-05-12T11:20:00Z'
        }
      ];

      setProjects(mockProjects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: 'New Monitoring Project',
      keywords: [],
      sources: [],
      latency_config: {
        real_time: true,
        batch_interval_hours: 1
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingProject(newProject);
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;
    
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/projects${editingProject.id === 'new' ? '' : '/' + editingProject.id}`, {
      //   method: editingProject.id === 'new' ? 'POST' : 'PUT',
      //   body: JSON.stringify(editingProject)
      // });

      const existingIndex = projects.findIndex(p => p.id === editingProject.id);
      if (existingIndex >= 0) {
        const updatedProjects = [...projects];
        updatedProjects[existingIndex] = { ...editingProject, updated_at: new Date().toISOString() };
        setProjects(updatedProjects);
      } else {
        setProjects([...projects, { ...editingProject, id: Date.now().toString() }]);
      }
      
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const addKeyword = () => {
    if (editingProject && newKeyword.trim()) {
      setEditingProject({
        ...editingProject,
        keywords: [...editingProject.keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    if (editingProject) {
      setEditingProject({
        ...editingProject,
        keywords: editingProject.keywords.filter(k => k !== keyword)
      });
    }
  };

  const addSource = () => {
    if (editingProject && newSource.trim()) {
      setEditingProject({
        ...editingProject,
        sources: [...editingProject.sources, newSource.trim()]
      });
      setNewSource('');
    }
  };

  const removeSource = (source: string) => {
    if (editingProject) {
      setEditingProject({
        ...editingProject,
        sources: editingProject.sources.filter(s => s !== source)
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Project Configuration</h1>
            <p className="text-muted-foreground">Manage monitoring projects and data sources</p>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (editingProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Project</h1>
            <p className="text-muted-foreground">Configure monitoring project settings</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setEditingProject(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject}>
              <Save className="h-4 w-4 mr-2" />
              Save Project
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <Label>Keywords to Monitor</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword"
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button onClick={addKeyword}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editingProject.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="flex items-center space-x-1">
                      <span>{keyword}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Sources to Monitor</Label>
                <div className="flex space-x-2 mt-2">
                  <Select value={newSource} onValueChange={setNewSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reddit">Reddit</SelectItem>
                      <SelectItem value="Twitter/X">Twitter/X</SelectItem>
                      <SelectItem value="Practo">Practo</SelectItem>
                      <SelectItem value="Quora">Quora</SelectItem>
                      <SelectItem value="LocalCircles">LocalCircles</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addSource}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editingProject.sources.map((source) => (
                    <Badge key={source} variant="outline" className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>{source}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSource(source)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latency Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="realtime">Processing Mode</Label>
                <Select 
                  value={editingProject.latency_config.real_time.toString()} 
                  onValueChange={(value) => setEditingProject({
                    ...editingProject,
                    latency_config: {
                      ...editingProject.latency_config,
                      real_time: value === 'true'
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Real-time</SelectItem>
                    <SelectItem value="false">Batch Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!editingProject.latency_config.real_time && (
                <div>
                  <Label htmlFor="interval">Batch Interval (Hours)</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    max="24"
                    value={editingProject.latency_config.batch_interval_hours}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      latency_config: {
                        ...editingProject.latency_config,
                        batch_interval_hours: parseInt(e.target.value) || 1
                      }
                    })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(editingProject.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(editingProject.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Keywords</Label>
                  <p className="text-2xl font-bold">{editingProject.keywords.length}</p>
                </div>
                <div>
                  <Label>Sources</Label>
                  <p className="text-2xl font-bold">{editingProject.sources.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Configuration</h1>
          <p className="text-muted-foreground">Manage monitoring projects and data sources</p>
        </div>
        <Button onClick={handleCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>{project.name}</span>
                  </CardTitle>
                  <CardDescription>
                    Last updated: {new Date(project.updated_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingProject(project)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Keywords ({project.keywords.length})</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.keywords.slice(0, 5).map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {project.keywords.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.keywords.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Sources ({project.sources.length})</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.sources.map((source) => (
                    <Badge key={source} variant="outline" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {project.latency_config.real_time ? 'Real-time' : `${project.latency_config.batch_interval_hours}h batch`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No projects configured</h3>
              <p>Create your first monitoring project to start collecting pharmacovigilance signals.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
