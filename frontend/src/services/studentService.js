import { supabase } from "@/lib/supabase";

export const createStudent = async (data) => {

  try {

    // 1️⃣ cria usuário no sistema de autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password
    });

    if (authError) {
      throw authError;
    }

    const userId = authData.user.id;

    // 2️⃣ cria perfil na tabela profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        name: data.name,
        email: data.email,
        is_admin: false,
        access_start: data.access_start,
        access_end: data.access_end,
        notes: data.notes || null
      });

    if (profileError) {
      throw profileError;
    }

    return { success: true };

  } catch (error) {

    console.error("Erro ao criar aluno:", error);
    throw error;

  }

};