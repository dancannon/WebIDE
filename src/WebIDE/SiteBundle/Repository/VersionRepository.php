<?php
namespace WebIDE\SiteBundle\Repository;

use Doctrine\ORM\EntityRepository;
use WebIDE\SiteBundle\Entity\ProjectVersion;

class VersionRepository extends EntityRepository
{

    public function findVersion($projectid, $version)
    {
        $em = $this->getEntityManager();

        /**
         * Find version
         * @var ProjectVersion $version
         */
        $query = $em->createQuery("SELECT v FROM WebIDESiteBundle:ProjectVersion v WHERE v.project = :projectid AND v.versionNumber = :version ORDER BY v.versionNumber DESC");
        $query->setParameter("projectid", $projectid);
        $query->setParameter("version", $version);
        return $query->getSingleResult();
    }

    public function findVersionByProject($projectid)
    {
        $em = $this->getEntityManager();

        /**
         * Find version
         * @var ProjectVersion $version
         */
        $query = $em->createQuery("SELECT v FROM WebIDESiteBundle:ProjectVersion v WHERE v.project = :projectid ORDER BY v.versionNumber DESC");
        $query->setParameter("projectid", $projectid);
        $query->setMaxResults(1);
        return $query->getSingleResult();
    }
}