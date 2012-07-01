<?php

namespace WebIDE\SiteBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\SerializerBundle\Annotation as Serializer;
use Doctrine\Common\Collections\ArrayCollection;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * WebIDE\SiteBundle\Entity\ProjectVersion
 *
 * @ORM\Table(name="project_versions")
 * @ORM\Entity(repositoryClass="WebIDE\SiteBundle\Repository\VersionRepository")
 */
class ProjectVersion
{
    /**
     * @var integer $id
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(name="version_number", type="integer")
     */
    private $versionNumber = 1;

    /**
     * @ORM\ManyToOne(targetEntity="Project", cascade={"all"})
     * @Serializer\Accessor(getter="getProjectId")
     */
    private $project;

    /**
     * @var datetime $created
     *
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(type="datetime")
     */
    private $createdAt;

    /**
     * @var datetime $updated
     *
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime")
     */
    private $updatedAt;

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    public function getVersionNumber()
    {
        return $this->versionNumber;
    }

    public function setVersionNumber($versionNumber)
    {
        $this->versionNumber = $versionNumber;
    }

    public function incVersionNumber()
    {
        $this->versionNumber += 1;
    }

    public function getProject()
    {
        return $this->project;
    }

    public function getProjectId()
    {
        return $this->getProject() ? $this->getProject()->getId() : null;
    }

    public function setProject($project)
    {
        $this->project = $project;
    }

    /**
     * @return datetime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @param datetime $created
     */
    public function setCreatedAt($created)
    {
        $this->createdAt = $created;
    }

    /**
     * @return datetime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @param datetime $updated
     */
    public function setUpdatedAt($updated)
    {
        $this->updatedAt = $updated;
    }
}