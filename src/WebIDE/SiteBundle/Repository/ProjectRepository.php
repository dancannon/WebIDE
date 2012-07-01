<?php
namespace WebIDE\SiteBundle\Repository;

use Doctrine\ORM\EntityRepository;
use WebIDE\SiteBundle\Entity\Project;
use WebIDE\SiteBundle\Entity\ProjectVersion;

class ProjectRepository extends EntityRepository
{
    public function findProjectsByUser($user, $maxResults=null)
    {
        $em = $this->getEntityManager();
        $query = $em->createQuery("SELECT p FROM WebIDESiteBundle:Project p WHERE p.user = :user ORDER BY p.updatedAt DESC");
        $query->setParameter("user", $user);
        $query->setMaxResults($maxResults);

        return $query->getResult();
    }

    public function findProject($id, $version)
    {
        $em = $this->getEntityManager();

        /**
         * Find project
         * @var Project $project
         */
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f WITH f.version = :version WHERE p.id = :id");
        $query->setParameter("id", $id);
        $query->setParameter("version", $version);
        $project = $query->getSingleResult();

        $project->setCurrentVersion($version->getVersionNumber());

        return $project;
    }

    public function findProjectByVersion($id, $version)
    {
        $em = $this->getEntityManager();

        /**
         * Find project
         * @var Project $project
         */
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f WITH f.version = :version WHERE p.id = :id");
        $query->setParameter("id", $id);
        $query->setParameter("version", $version);
        $project = $query->getSingleResult();

        $project->setCurrentVersion($version->getVersionNumber());

        return $project;
    }
}