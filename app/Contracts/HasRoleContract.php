<?php

namespace App\Contracts;

use Illuminate\Support\Collection;

interface HasRoleContract
{
      /**
       * Check whether the model has the given role(s)
       * @param string|array $roles
       */
      public function hasRole($roles): bool;

      /**
       * Get role names as a collection
       * @return Collection
       */
      public function getRoleNames(): Collection;

      /**
       * Assign a role
       */
      /**
       * Assign one or more roles. Matches Spatie\Permission's HasRoles trait signature.
       *
       * @param mixed ...$roles
       * @return mixed
       */
      public function assignRole(...$roles);
}
