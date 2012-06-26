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
 * @ORM\Entity
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
     * @ORM\ManyToOne(targetEntity="Project")
     */
    private $project;

    /**
     * @var datetime $created
     *
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(type="datetime")
     */
    private $created;

    /**
     * @var datetime $updated
     *
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime")
     */
    private $updated;

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

    public function setProject($project)
    {
        $this->project = $project;
    }

    /**
     * @return datetime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @param datetime $created
     */
    public function setCreated($created)
    {
        $this->created = $created;
    }

    /**
     * @return datetime
     */
    public function getUpdated()
    {
        return $this->updated;
    }

    /**
     * @param datetime $updated
     */
    public function setUpdated($updated)
    {
        $this->updated = $updated;
    }
}