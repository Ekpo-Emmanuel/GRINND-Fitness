'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import SignOutButton from '../auth/components/SignOutButton';
import BottomNav from '@/app/components/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pill } from '@/components/ui/pill';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  User, 
  Settings, 
  Activity, 
  Target, 
  Calendar, 
  Edit3, 
  Save, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  Ruler,
  Scale
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showMeasurements, setShowMeasurements] = useState(false);
  
  const userProfile = useQuery(api.users.getProfile, 
    user?.id ? { userId: user.id } : 'skip'
  );

  const updateMeasurements = useMutation(api.users.updateMeasurements);
  
  const [measurements, setMeasurements] = useState({
    bodyFat: userProfile?.measurements?.bodyFat || '',
    caloricIntake: userProfile?.measurements?.caloricIntake || '',
    neck: userProfile?.measurements?.neck || '',
    shoulders: userProfile?.measurements?.shoulders || '',
    chest: userProfile?.measurements?.chest || '',
    leftBicep: userProfile?.measurements?.leftBicep || '',
    rightBicep: userProfile?.measurements?.rightBicep || '',
    leftForearm: userProfile?.measurements?.leftForearm || '',
    rightForearm: userProfile?.measurements?.rightForearm || '',
    abs: userProfile?.measurements?.abs || '',
    waist: userProfile?.measurements?.waist || '',
    hips: userProfile?.measurements?.hips || '',
    leftThigh: userProfile?.measurements?.leftThigh || '',
    rightThigh: userProfile?.measurements?.rightThigh || '',
    leftCalf: userProfile?.measurements?.leftCalf || '',
    rightCalf: userProfile?.measurements?.rightCalf || ''
  });

  useEffect(() => {
    if (userProfile?.measurements) {
      setMeasurements({
        bodyFat: userProfile.measurements.bodyFat || '',
        caloricIntake: userProfile.measurements.caloricIntake || '',
        neck: userProfile.measurements.neck || '',
        shoulders: userProfile.measurements.shoulders || '',
        chest: userProfile.measurements.chest || '',
        leftBicep: userProfile.measurements.leftBicep || '',
        rightBicep: userProfile.measurements.rightBicep || '',
        leftForearm: userProfile.measurements.leftForearm || '',
        rightForearm: userProfile.measurements.rightForearm || '',
        abs: userProfile.measurements.abs || '',
        waist: userProfile.measurements.waist || '',
        hips: userProfile.measurements.hips || '',
        leftThigh: userProfile.measurements.leftThigh || '',
        rightThigh: userProfile.measurements.rightThigh || '',
        leftCalf: userProfile.measurements.leftCalf || '',
        rightCalf: userProfile.measurements.rightCalf || ''
      });
    }
  }, [userProfile?.measurements]);
  
  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveMeasurements = async () => {
    if (!user?.id) return;
    
    try {
      await updateMeasurements({
        userId: user.id,
        measurements
      });
      toast.success('Measurements saved successfully!');
      setShowMeasurements(false);
    } catch (error) {
      console.error('Error saving measurements:', error);
      toast.error('Failed to save measurements. Please try again.');
    }
  };
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);
  
  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--ds-bg-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--ds-accent-purple)]"></div>
      </div>
    );
  }

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return (
    <div className="min-h-screen bg-[var(--ds-bg-primary)]">
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[color:var(--ds-text-primary)] mb-2">Profile</h1>
          <p className="text-[color:var(--ds-text-secondary)]">Manage your fitness journey</p>
        </div>
        
        {/* Profile Overview Card */}
        <Card className="mb-6 border-0 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--ds-gradient-purple-from), var(--ds-gradient-purple-to))' }}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              {userProfile?.profilePicture ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/30">
                  <img
                    src={userProfile.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="bg-white/20 rounded-2xl p-4">
                  <User className="h-8 w-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white">{userProfile?.name || user.email?.split('@')[0] || 'User'}</h2>
                <p className="text-white/80 text-sm">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/profile/edit')}
                className="text-white hover:bg-white/20 rounded-xl h-10 w-10 p-0"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border border-[color:var(--ds-border)] bg-[var(--ds-surface)] hover:bg-[var(--ds-surface-elevated)] transition-all rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 rounded-xl bg-[var(--ds-accent-purple)]/10">
                  <Scale className="h-5 w-5 text-[var(--ds-accent-purple)]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[color:var(--ds-text-primary)]">{userProfile?.weight || '--'}</p>
              <p className="text-xs text-[color:var(--ds-text-secondary)] font-medium">kg</p>
            </CardContent>
          </Card>
          <Card className="border border-[color:var(--ds-border)] bg-[var(--ds-surface)] hover:bg-[var(--ds-surface-elevated)] transition-all rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 rounded-xl bg-[var(--ds-accent-purple)]/10">
                  <Ruler className="h-5 w-5 text-[var(--ds-accent-purple)]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[color:var(--ds-text-primary)]">{userProfile?.height || '--'}</p>
              <p className="text-xs text-[color:var(--ds-text-secondary)] font-medium">cm</p>
            </CardContent>
          </Card>
          <Card className="border border-[color:var(--ds-border)] bg-[var(--ds-surface)] hover:bg-[var(--ds-surface-elevated)] transition-all rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 rounded-xl bg-[var(--ds-accent-purple)]/10">
                  <TrendingUp className="h-5 w-5 text-[var(--ds-accent-purple)]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[color:var(--ds-text-primary)]">{userProfile?.age || '--'}</p>
              <p className="text-xs text-[color:var(--ds-text-secondary)] font-medium">years</p>
            </CardContent>
          </Card>
        </div>

        {/* Training Schedule */}
        <Card className="mb-6 border border-[color:var(--ds-border)] bg-[var(--ds-surface)] rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg text-[color:var(--ds-text-primary)]">
              <div className="p-2 rounded-xl bg-[var(--ds-accent-purple)]/10 mr-3">
                <Calendar className="h-5 w-5 text-[var(--ds-accent-purple)]" />
              </div>
              Training Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {dayLabels.map((day, index) => {
                const dayKey = dayKeys[index];
                const isTrainingDay = userProfile?.trainingDays?.[dayKey as keyof typeof userProfile.trainingDays];
                
                return (
                  <div 
                    key={dayKey} 
                    className={`flex items-center justify-center h-12 rounded-xl text-sm font-medium transition-all ${
                      isTrainingDay 
                        ? 'bg-[var(--ds-accent-purple)] text-white border border-[var(--ds-accent-purple)] scale-105 shadow-md' 
                        : 'bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-secondary)] border border-[color:var(--ds-border)] hover:border-[var(--ds-accent-purple)]/30'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Muscle Focus */}
        <Card className="mb-6 border border-[color:var(--ds-border)]  bg-[var(--ds-surface)] rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg text-[color:var(--ds-text-primary)]">
              <div className="p-2 rounded-xl bg-[var(--ds-accent-purple)]/10 mr-3">
                <Target className="h-5 w-5 text-[var(--ds-accent-purple)]" />
              </div>
              Muscle Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {userProfile?.muscleFocus?.length ? (
                userProfile.muscleFocus.map(muscle => (
                  <Pill key={muscle} variant="secondary" size="md">
                    {muscle}
                  </Pill>
                ))
              ) : (
                <p className="text-[color:var(--ds-text-secondary)] text-sm">No muscle groups selected</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Body Measurements */}
        <Card className="mb-6 border border-[color:var(--ds-border)]  bg-[var(--ds-surface)] rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg text-[color:var(--ds-text-primary)]">
                <div className="p-2 rounded-xl bg-[var(--ds-accent-purple)]/10 mr-3">
                  <Activity className="h-5 w-5 text-[var(--ds-accent-purple)]" />
                </div>
                Body Measurements
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMeasurements(!showMeasurements)}
                className="text-[var(--ds-accent-purple)] hover:bg-[var(--ds-accent-purple)]/10 rounded-xl h-10 w-10 p-0"
              >
                {showMeasurements ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!showMeasurements ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-[var(--ds-surface-elevated)] rounded-xl border border-[color:var(--ds-border)]">
                  <p className="text-2xl font-bold text-[color:var(--ds-text-primary)]">{userProfile?.measurements?.bodyFat || '--'}</p>
                  <p className="text-xs text-[color:var(--ds-text-secondary)] font-medium">Body Fat %</p>
                </div>
                <div className="text-center p-4 bg-[var(--ds-surface-elevated)] rounded-xl border border-[color:var(--ds-border)]">
                  <p className="text-2xl font-bold text-[color:var(--ds-text-primary)]">{userProfile?.measurements?.caloricIntake || '--'}</p>
                  <p className="text-xs text-[color:var(--ds-text-secondary)] font-medium">Calories</p>
                </div>
                <div className="text-center p-4 bg-[var(--ds-surface-elevated)] rounded-xl border border-[color:var(--ds-border)]">
                  <p className="text-2xl font-bold text-[color:var(--ds-text-primary)]">{userProfile?.measurements?.chest || '--'}</p>
                  <p className="text-xs text-[color:var(--ds-text-secondary)] font-medium">Chest cm</p>
                </div>
                <div className="text-center p-4 bg-[var(--ds-surface-elevated)] rounded-xl border border-[color:var(--ds-border)]">
                  <p className="text-2xl font-bold text-[color:var(--ds-text-primary)]">{userProfile?.measurements?.waist || '--'}</p>
                  <p className="text-xs text-[color:var(--ds-text-secondary)] font-medium">Waist cm</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-[color:var(--ds-text-primary)] mb-3 flex items-center">
                    <div className="p-1 rounded-lg bg-[var(--ds-accent-purple)]/10 mr-2">
                      <TrendingUp className="h-4 w-4 text-[var(--ds-accent-purple)]" />
                    </div>
                    Core Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="bodyFat" className="text-xs text-[color:var(--ds-text-secondary)] font-medium">Body Fat (%)</Label>
                      <Input
                        id="bodyFat"
                        type="number"
                        name="bodyFat"
                        value={measurements.bodyFat}
                        onChange={handleMeasurementChange}
                        className="mt-1 rounded-xl border border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] focus:border-[var(--ds-accent-purple)]"
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="caloricIntake" className="text-xs text-[color:var(--ds-text-secondary)] font-medium">Calories (kcal)</Label>
                      <Input
                        id="caloricIntake"
                        type="number"
                        name="caloricIntake"
                        value={measurements.caloricIntake}
                        onChange={handleMeasurementChange}
                        className="mt-1 rounded-xl border border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] focus:border-[var(--ds-accent-purple)]"
                        placeholder="2500"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold text-[color:var(--ds-text-primary)] mb-3">Upper Body</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="neck" className="text-xs text-gray-500">Neck (cm)</Label>
                      <Input
                        id="neck"
                        type="number"
                        name="neck"
                        value={measurements.neck}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="38"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shoulders" className="text-xs text-gray-500">Shoulders (cm)</Label>
                      <Input
                        id="shoulders"
                        type="number"
                        name="shoulders"
                        value={measurements.shoulders}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="chest" className="text-xs text-gray-500">Chest (cm)</Label>
                      <Input
                        id="chest"
                        type="number"
                        name="chest"
                        value={measurements.chest}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="leftBicep" className="text-xs text-gray-500">Left Bicep (cm)</Label>
                      <Input
                        id="leftBicep"
                        type="number"
                        name="leftBicep"
                        value={measurements.leftBicep}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="35"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rightBicep" className="text-xs text-gray-500">Right Bicep (cm)</Label>
                      <Input
                        id="rightBicep"
                        type="number"
                        name="rightBicep"
                        value={measurements.rightBicep}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="35"
                      />
                    </div>
                    <div>
                      <Label htmlFor="leftForearm" className="text-xs text-gray-500">Left Forearm (cm)</Label>
                      <Input
                        id="leftForearm"
                        type="number"
                        name="leftForearm"
                        value={measurements.leftForearm}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rightForearm" className="text-xs text-gray-500">Right Forearm (cm)</Label>
                      <Input
                        id="rightForearm"
                        type="number"
                        name="rightForearm"
                        value={measurements.rightForearm}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Midsection</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="abs" className="text-xs text-gray-500">Abs (cm)</Label>
                      <Input
                        id="abs"
                        type="number"
                        name="abs"
                        value={measurements.abs}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="85"
                      />
                    </div>
                    <div>
                      <Label htmlFor="waist" className="text-xs text-gray-500">Waist (cm)</Label>
                      <Input
                        id="waist"
                        type="number"
                        name="waist"
                        value={measurements.waist}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="80"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hips" className="text-xs text-gray-500">Hips (cm)</Label>
                      <Input
                        id="hips"
                        type="number"
                        name="hips"
                        value={measurements.hips}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="95"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Lower Body</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="leftThigh" className="text-xs text-gray-500">Left Thigh (cm)</Label>
                      <Input
                        id="leftThigh"
                        type="number"
                        name="leftThigh"
                        value={measurements.leftThigh}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rightThigh" className="text-xs text-gray-500">Right Thigh (cm)</Label>
                      <Input
                        id="rightThigh"
                        type="number"
                        name="rightThigh"
                        value={measurements.rightThigh}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <Label htmlFor="leftCalf" className="text-xs text-gray-500">Left Calf (cm)</Label>
                      <Input
                        id="leftCalf"
                        type="number"
                        name="leftCalf"
                        value={measurements.leftCalf}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rightCalf" className="text-xs text-gray-500">Right Calf (cm)</Label>
                      <Input
                        id="rightCalf"
                        type="number"
                        name="rightCalf"
                        value={measurements.rightCalf}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="40"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={saveMeasurements}
                  variant="primary"
                  size="lg"
                  className="w-full rounded-xl"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Measurements
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <SignOutButton className="w-full justify-start bg-red-50 text-red-600 border-red-200 hover:bg-red-100 rounded-xl" />
      </div>
    </div>
  );
} 