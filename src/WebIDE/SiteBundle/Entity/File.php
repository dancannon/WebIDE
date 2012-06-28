<?php
namespace WebIDE\SiteBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use JMS\SerializerBundle\Annotation as Serializer;

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
     * @ORM\Column(type="string")
     */
    protected $name;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $active;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $selected;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $resource;

    /**
     * @ORM\Column(type="integer", name="file_order")
     */
    protected $order;

    /**
     * @ORM\ManyToOne(targetEntity="Project", inversedBy="files")
     * @Serializer\Accessor(getter="getProjectId")
     */
    protected $project;

    /**
     * @ORM\Column(type="string", length=10)
     */
    protected $type;

    /**
     * @ORM\Column(type="text")
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
    private $created;

    /**
     * @var datetime $updated
     *
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime")
     */
    private $updated;

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

    public function isResource()
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