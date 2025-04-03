import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NodeSelectionService } from '../_services/node-selection.service';

export const tabGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const nodeService = inject(NodeSelectionService); // Must provide selected node access
  const selectedNode = nodeService.getSelectedNode();

  if (selectedNode?.data?.publicId && selectedNode.data.type === 'position') {
    return true; // Allow access to the route
  } else {
    router.navigate(['/dashboard']); // Or show warning
  }
  return false; // block /settings route from loading
};
