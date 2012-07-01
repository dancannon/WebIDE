<?php
namespace WebIDE\SiteBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\SerializerBundle\Annotation as Serializer;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity
 * @ORM\Table(name="files")
 */
class File implements OwnableEntity
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @ORM\Column(type="string", length=100)
     * @Assert\MinLength(1)
     * @Assert\MaxLength(100)
     * @Assert\Type(type="string")
     * @Assert\NotBlank()
     */
    protected $name;

    /**
     * @ORM\Column(type="boolean")
     * @Assert\Type(type="boolean")
     */
    protected $active;

    /**
     * @ORM\Column(type="boolean")
     * @Assert\Type(type="boolean")
     */
    protected $selected;

    /**
     * @ORM\Column(type="string", nullable=true)
     * @Assert\Type(type="string")
     */
    protected $resource;

    /**
     * @ORM\Column(type="integer", name="file_order")
     * @Assert\Type(type="integer")
     */
    protected $order;

    /**
     * @ORM\ManyToOne(targetEntity="Project", inversedBy="files")
     * @Serializer\Accessor(getter="getProjectId")
     */
    protected $project;

    /**
     * @ORM\Column(type="string", length=10)
     * @Assert\Type(type="string")
     */
    protected $type;

    /**
     * @ORM\Column(type="text")
     * @Assert\Type(type="string")
     */
    protected $content;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     * @Serializer\Exclude
     */
    private $user;

    /**
     * @ORM\ManyToOne(targetEntity="ProjectVersion", cascade={"persist"})
     * @ORM\JoinColumn(name="version_id", referencedColumnName="id")
     * @Serializer\Accessor(getter="getVersionId")
     */
    private $version;

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

    public function isActive()
    {
        return $this->active;
    }

    public function setActive($active)
    {
        $this->active = $active;
    }

    public function isSelected()
    {
        return $this->selected;
    }

    public function setSelected($selected)
    {
        $this->selected = $selected;
    }

    public function getResource()
    {
        return $this->resource;
    }

    public function setResource($resource)
    {
        $this->resource = $resource;
    }

    public function getOrder()
    {
        return $this->order;
    }

    public function setOrder($order)
    {
        $this->order = $order;
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

    public function getType()
    {
        return $this->type;
    }

    public function setType($type)
    {
        $this->type = $type;
    }

    public function getContent()
    {
        return $this->content;
    }

    public function setContent($content)
    {
        $this->content = $content;
    }

    public function getVersion()
    {
        return $this->version;
    }

    public function getVersionId()
    {
        return $this->getVersion() ? $this->getVersion()->getId() : null;
    }

    public function setVersion($version)
    {
        $this->version = $version;
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

    public function toArray()
    {
        return array(
            'id' => $this->getId(),
            'active' => $this->isActive(),
            'selected' => $this->isSelected(),
            'resource' => $this->getResource(),
            'order' => $this->getOrder(),
            'project' => $this->getProject(),
            'type' => $this->getType(),
            'name' => $this->getName(),
            'content' => $this->getContent(),
            'user' => $this->getUser(),
            'createdAt' => $this->getCreatedAt(),
            'updatedAt' => $this->getUpdatedAt()
        );
    }
}