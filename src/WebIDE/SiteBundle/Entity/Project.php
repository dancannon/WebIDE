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
class Project implements OwnableEntity
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
     * @Serializer\Accessor(getter="getVersionId")
     */
    private $version;

    private $current_version;

    /**
     * @ORM\OneToMany(targetEntity="ProjectVersion", mappedBy="project")
     *
     */
    private $versions;

    /**
     * @var string $hash
     *
     * @ORM\Column(name="hash", type="string", length=255)
     */
    private $hash;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     * @Serializer\Exclude()
     */
    private $user;


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
     * @param array $files
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

    public function getVersionId()
    {
        return $this->getVersion() ? $this->getVersion()->getId() : null;
    }

    /**
     * @param string $version
     */
    public function setVersion($version)
    {
        $this->version = $version;
        $version->setProject($this);
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

    public function getUser()
    {
        return $this->user;
    }

    public function setUser(User $user)
    {
        $this->user = $user;
    }

    /**
     * @return \datetime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @param \datetime $created
     */
    public function setCreated($created)
    {
        $this->created = $created;
    }

    /**
     * @return \datetime
     */
    public function getUpdated()
    {
        return $this->updated;
    }

    /**
     * @param \datetime $updated
     */
    public function setUpdated($updated)
    {
        $this->updated = $updated;
    }
}