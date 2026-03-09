import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const CreateStudentPage = () => {

const navigate = useNavigate()

const [loading,setLoading] = useState(false)

const [form,setForm] = useState({
name:"",
email:"",
password:"",
phone:"",
birth_date:"",
gender:"",
height_cm:"",
weight_kg:"",
goal:"",
training_level:"beginner",
plan:"basic",
access_start:"",
access_end:"",
injuries:"",
emergency_contact:"",
notes:"",
role:"student",
is_active:true
})

const handleChange = (field,value)=>{
setForm(prev=>({...prev,[field]:value}))
}

const maskPhone = (value) => {

let v = value.replace(/\D/g,'')

if(v.length <= 10){
v = v.replace(/(\d{2})(\d)/,"($1) $2")
v = v.replace(/(\d{4})(\d)/,"$1-$2")
}else{
v = v.replace(/(\d{2})(\d)/,"($1) $2")
v = v.replace(/(\d{5})(\d)/,"$1-$2")
}

return v.slice(0,15)

}

const handleSubmit = async(e)=>{
e.preventDefault()

try{

setLoading(true)

const { data:userData, error:authError } =
await supabase.auth.signUp({
email:form.email,
password:form.password
})

if(authError) throw authError

const userId = userData.user.id

await supabase
.from("profiles")
.insert({
id:userId,
user_id:userId,
name:form.name,
email:form.email,
phone:form.phone,
birth_date:form.birth_date || null,
gender:form.gender || null,
height_cm:form.height_cm || null,
weight_kg:form.weight_kg || null,
goal:form.goal || null,
training_level:form.training_level,
plan:form.plan,
access_start:form.access_start || null,
access_end:form.access_end || null,
injuries:form.injuries,
emergency_contact:form.emergency_contact,
notes:form.notes,
role:"student",
is_active:true
})

if(profileError) throw profileError

toast.success("Aluno criado com sucesso")

navigate("/admin/alunos")

}catch(err){

toast.error(err.message)

}finally{
setLoading(false)
}

}

return (

<AdminLayout>

<div className="space-y-6">

<Card>

<CardHeader>
<CardTitle>Novo Aluno</CardTitle>
</CardHeader>

<CardContent>

<form onSubmit={handleSubmit} className="grid gap-4">

<div>
<Label>Nome *</Label>
<Input
value={form.name}
onChange={(e)=>handleChange("name",e.target.value)}
required
/>
</div>

<div>
<Label>Email *</Label>
<Input
type="email"
value={form.email}
onChange={(e)=>handleChange("email",e.target.value)}
required
/>
</div>

<div>
<Label>Senha *</Label>
<Input
type="password"
value={form.password}
onChange={(e)=>handleChange("password",e.target.value)}
required
/>
</div>

<div>
<Label>Telefone</Label>
<Input
value={form.phone}
onChange={(e)=>handleChange("phone",maskPhone(e.target.value))}
/>
</div>

<div>
<Label>Data de Nascimento</Label>
<Input
type="date"
value={form.birth_date}
onChange={(e)=>handleChange("birth_date",e.target.value)}
/>
</div>

<div>
<Label>Gênero</Label>
<select
className="w-full bg-muted border-border text-foreground rounded-md px-3 py-2"
value={form.gender}
onChange={(e)=>handleChange("gender",e.target.value)}
>
<option value="">Selecione</option>
<option value="Masculino">Masculino</option>
<option value="Feminino">Feminino</option>
<option value="Prefiro não dizer">Prefiro não dizer</option>
</select>
</div>

<div>
<Label>Altura (cm)</Label>
<Input
type="number"
min="0"
step="0.1"
value={form.height_cm}
onChange={(e)=>handleChange(
 "height_cm",
 Math.max(0, e.target.value)
)}
/>
</div>

<div>
<Label>Peso (kg)</Label>
<Input
type="number"
min="0"
step="0.1"
value={form.weight_kg}
onChange={(e)=>handleChange(
 "weight_kg",
 Math.max(0, e.target.value)
)}
/>
</div>

<div>
<Label>Objetivo</Label>
<select
className="w-full bg-muted border-border text-foreground rounded-md px-3 py-2"
value={form.goal}
onChange={(e)=>handleChange("goal",e.target.value)}
>
<option value="">Selecione</option>
<option value="fat_loss">Emagrecimento</option>
<option value="muscle_gain">Hipertrofia</option>
<option value="conditioning">Condicionamento</option>
<option value="rehabilitation">Reabilitação</option>
<option value="health">Saúde</option>
</select>
</div>

<div>
<Label>Nível de Treino</Label>
<select
className="w-full bg-muted border-border text-foreground rounded-md px-3 py-2"
value={form.training_level}
onChange={(e)=>handleChange("training_level",e.target.value)}
>
<option value="beginner">Iniciante</option>
<option value="intermediate">Intermediário</option>
<option value="advanced">Avançado</option>
</select>
</div>

<div>
<Label>Plano</Label>
<select
className="w-full bg-muted border-border text-foreground rounded-md px-3 py-2"
value={form.plan}
onChange={(e)=>handleChange("plan",e.target.value)}
>
<option value="basic">Basic</option>
<option value="premium">Premium</option>
<option value="vip">VIP</option>
</select>
</div>

<div>
<Label>Início do Plano</Label>
<Input
type="date"
value={form.access_start}
onChange={(e)=>handleChange("access_start",e.target.value)}
/>
</div>

<div>
<Label>Fim do Plano</Label>
<Input
type="date"
value={form.access_end}
onChange={(e)=>handleChange("access_end",e.target.value)}
/>
</div>

<div>
<Label>Lesões</Label>
<Input
value={form.injuries}
onChange={(e)=>handleChange("injuries",e.target.value)}
/>
</div>

<div>
<Label>Contato de Emergência</Label>
<Input
value={form.emergency_contact}
onChange={(e)=>handleChange("emergency_contact",e.target.value)}
/>
</div>

<div>
<Label>Observações</Label>
<textarea
className="w-full border rounded p-2"
rows={3}
value={form.notes}
onChange={(e)=>handleChange("notes",e.target.value)}
/>
</div>

<Button type="submit" disabled={loading}>
{loading ? "Criando..." : "Criar Aluno"}
</Button>

</form>

</CardContent>

</Card>

</div>

</AdminLayout>
)

}

export default CreateStudentPage