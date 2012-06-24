<?php

namespace WebIDE\SiteBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\SerializerBundle\Annotation as Serializer;
use Doctrine\Common\Collections\ArrayCollection;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * WebIDE\SiteBundle\Entity\Project
 *
 * @ORM\Table(name="projects")
 * @ORM\Entity
 */
class Project
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
     * @var string $files
     *
     * @ORM\OneToMany(targetEntity="File", mappedBy="project", cascade={"all"})
     */
    private $files;

    /**
     * @ORM\OneToOne(targetEntity="ProjectVersion", cascade={"persist"})
     * @ORM\JoinColumn(name="version_id", referencedColumnName="id")
     */
    private $version;

    private $current_version;

    /**
     * @ORM\OneToMany(targetEntity="ProjectVersion", mappedBy="project")
     */
    private $versions;

    /**
     * @var string $hash
     *
     * @ORM\Column(name="hash", type="string", length=255)
     */
    private $hash;


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

    public function __construct()
    {
        $this->files = new ArrayCollection();
    }

    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set files
     *
     * @param ArrayCollection $files
     * @return Project
     */
    public function setFiles($files)
    {
        $this->files = new ArrayCollection();

        foreach($files as $file) {
            $this->addFile($file);
        }

        return $this;
    }

    /**
     * Add a files
     *
     * @param File $file
     * @return Project
     */
    public function addFile($file)
    {
        $file->setProject($this);

        $this->files->add($file);
        return $this;
    }

    /**
     * Get files
     *
     * @return ArrayCollection
     */
    public function getFiles()
    {
        return $this->files;
    }

    /**
     * @return string
     */
    public function getVersion()
    {
        return $this->version;
    }

    /**
     * @param string $version
     */
    public function setVersion($version)
    {
        $this->version = $version;
    }

    public function getCurrentVersion()
    {
        return $this->current_version;
    }

    public function setCurrentVersion($current_version)
    {
        $this->current_version = $current_version;
    }

    public function getVersions()
    {
        return $this->versions;
    }

    /**
     * Set hash
     *
     * @param string $hash
     * @return Project
     */
    public function setHash($hash)
    {
        $this->hash = $hash;
        return $this;
    }

    /**
     * Get hash
     *
     * @return string 
     */
    public function getHash()
    {
        return $this->hash;
    }

    /**
     * @return \WebIDE\SiteBundle\Entity\datetime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @param \WebIDE\SiteBundle\Entity\datetime $created
     */
    public function setCreated($created)
    {
        $this->created = $created;
    }

    /**
     * @return \WebIDE\SiteBundle\Entity\datetime
     */
    public function getUpdated()
    {
        return $this->updated;
    }

    /**
     * @param \WebIDE\SiteBundle\Entity\datetime $updated
     */
    public function setUpdated($updated)
    {
        $this->updated = $updated;
    }
}