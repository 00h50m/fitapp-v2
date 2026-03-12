import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { MobileContainer, MobileContent } from "@/components/layout/MobileContainer";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const redirect = async () => {
      try {
        const { data } = await supabase
          .from("student_workouts")
          .select("id")
          .eq("student_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data?.id) {
          navigate(`/student/workout/${data.id}`, { replace: true });
        } else {
          navigate("/student/workouts", { replace: true });
        }
      } catch {
        navigate("/student/workouts", { replace: true });
      }
    };

    redirect();
  }, [user, navigate]);

  return (
    <MobileContainer>
      <MobileContent>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileContent>
    </MobileContainer>
  );
};

export default StudentDashboard;