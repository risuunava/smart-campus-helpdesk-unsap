import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Clock, MessageSquare, Users } from "lucide-react";

export default function TestThemePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="hero-gradient text-white">
        <div className="container-mobile py-16">
          <h1 className="text-4xl font-bold mb-4 animate-fade-in">
            Smart Campus Helpdesk UNSAP
          </h1>
          <p className="text-lg opacity-90 mb-6">
            Testing Theme & UI Components
          </p>
          <Button className="btn-gradient" size="lg">
            <MessageSquare className="mr-2 h-5 w-5" />
            Buat Laporan
          </Button>
        </div>
      </div>

      <div className="container-mobile py-12 space-y-8">
        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>🎨 Color Palette UNSAP</CardTitle>
            <CardDescription>Primary Brand Colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"].map((shade) => (
                <div key={shade} className="space-y-2">
                  <div className={`h-16 rounded-lg bg-brand-${shade}`} />
                  <p className="text-xs text-center font-mono">brand-{shade}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Badges */}
        <Card>
          <CardHeader>
            <CardTitle>🏷️ Priority Badges</CardTitle>
            <CardDescription>Visualisasi prioritas tiket</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Badge className="badge-urgent">
              <AlertCircle className="mr-1 h-3 w-3" />
              Urgent
            </Badge>
            <Badge className="badge-normal">
              <Clock className="mr-1 h-3 w-3" />
              Normal
            </Badge>
            <Badge className="badge-low">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Low
            </Badge>
          </CardContent>
        </Card>

        {/* Status Badges */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Status Badges</CardTitle>
            <CardDescription>Status tiket</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Badge className="badge-open">Open</Badge>
            <Badge className="badge-in-progress">In Progress</Badge>
            <Badge className="badge-resolved">Resolved</Badge>
            <Badge className="badge-closed">Closed</Badge>
          </CardContent>
        </Card>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-600" />
                Total Tiket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">1,234</p>
              <p className="text-sm text-slate-500">+20% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                SLA Respon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">2.5 Jam</p>
              <p className="text-sm text-slate-500">Rata-rata waktu respon</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Tiket Urgent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">23</p>
              <p className="text-sm text-slate-500">Butuh penanganan segera</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>⏳ Skeleton Loading</CardTitle>
            <CardDescription>Placeholder loading state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        {/* Gradient Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>🔘 Buttons</CardTitle>
            <CardDescription>Variasi tombol</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Button className="btn-gradient">Gradient Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}