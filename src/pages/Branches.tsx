import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranches } from "@/hooks/useBranches";

export default function Branches() {
  const { branches, isLoading, deleteBranch } = useBranches();

  return (
    <div>
      <PageHeader
        title="Branch Management"
        description="Manage company branches and locations."
        icon={Building2}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Branches ({branches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : branches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.city || 'N/A'}</TableCell>
                    <TableCell>{branch.employees?.full_name || 'Unassigned'}</TableCell>
                    <TableCell>{branch.phone || 'N/A'}</TableCell>
                    <TableCell>
                      {branch.is_headquarters ? (
                        <Badge className="bg-primary/10 text-primary">HQ</Badge>
                      ) : (
                        <Badge variant="outline">Branch</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => deleteBranch.mutate(branch.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No branches yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
