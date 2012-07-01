<?php

namespace WebIDE\SiteBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\SerializerBundle\Annotation as Serializer;
use Doctrine\Common\Collections\ArrayCollection;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * WebIDE\SiteBundle\Entity\Project
 *
 * @ORM\Table(name="projects")
 * @ORM\Entity(repositoryClass="WebIDE\SiteBundle\Repository\ProjectRepository")
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
     * @ORM\Column(type="string", length=100)
     * @Assert\MaxLength(100)
     * @Assert\Type(type="string")
     */
    private $name;

    /**
     * @ORM\Column(type="text")
     * @Assert\Type(type="string")
     */
    private $description;

    /**
     * @var string $files
     *
     * @ORM\OneToMany(targetEntity="File", mappedBy="project", cascade={"all"})
     * @Assert\Valid()
     */
    private $files;

    /**
     * @ORM\OneToMany(targetEntity="ProjectVersion", mappedBy="project", cascade={"remove"})
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
    private $createdAt;

    /**
     * @var datetime $updated
     *
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime")
     */
    private $updatedAt;

    private $current_version;

    private $readOnly;

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


    public function getName()
    {
        return $this->name;
    }

    public function setName($name)
    {
        $this->name = $name;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function setDescription($description)
    {
        $this->description = $description;
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
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @param \datetime $created
     */
    public function setCreatedAt($created)
    {
        $this->createdAt = $created;
    }

    /**
     * @return \datetime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @param \datetime $updated
     */
    public function setUpdatedAt($updated)
    {
        $this->updatedAt = $updated;
    }

    public function getCurrentVersion()
    {
        return $this->current_version;
    }

    public function setCurrentVersion($current_version)
    {
        $this->current_version = $current_version;
    }

    public function getReadOnly()
    {
        return $this->readOnly;
    }

    public function setReadOnly($readOnly)
    {
        $this->readOnly = $readOnly;
    }
}